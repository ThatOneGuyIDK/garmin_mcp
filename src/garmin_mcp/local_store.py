"""Local SQLite cache for Garmin Connect data.

Garmin's API is not designed for bulk historical queries. Hammering it on every
question gets you rate limited (429) or temporarily blocked (403). This module
keeps a small, queryable local copy so repeat analysis is instant and the web
dashboard can be built from a static snapshot instead of live calls.

Design notes:

* SQLite is the working store (``data/garmin.db`` by default, git-ignored).
* A compact JSON snapshot is exported for the static web dashboard and is
  committed to git, so the deployed site never talks to Garmin.
* Syncs are incremental: days that are already cached are skipped, except for
  the last few days, which are refreshed because Garmin finalizes them late.
"""

from __future__ import annotations

import json
import sqlite3
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, List, Optional, Tuple

DEFAULT_DB_PATH = Path("data") / "garmin.db"
DEFAULT_EXPORT_PATH = Path("web") / "public" / "data" / "garmin.json"

SCHEMA = """
CREATE TABLE IF NOT EXISTS daily (
    date TEXT PRIMARY KEY,
    steps INTEGER,
    distance_m REAL,
    active_calories REAL,
    total_calories REAL,
    floors INTEGER,
    resting_hr INTEGER,
    min_hr INTEGER,
    max_hr INTEGER,
    stress_avg INTEGER,
    stress_max INTEGER,
    spo2_avg REAL,
    respiration_avg REAL,
    body_battery_high INTEGER,
    body_battery_low INTEGER,
    body_battery_wake INTEGER,
    body_battery_charged INTEGER,
    body_battery_drained INTEGER,
    sleep_seconds INTEGER,
    sleep_score INTEGER,
    deep_sleep_s INTEGER,
    light_sleep_s INTEGER,
    rem_sleep_s INTEGER,
    awake_s INTEGER,
    sleep_start TEXT,
    sleep_end TEXT,
    hrv_avg REAL,
    hrv_weekly_avg REAL,
    hrv_high REAL,
    hrv_status TEXT,
    vo2max REAL,
    synced_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    start_time TEXT,
    name TEXT,
    type TEXT,
    distance_m REAL,
    duration_s REAL,
    moving_s REAL,
    elapsed_s REAL,
    avg_speed_mps REAL,
    avg_hr INTEGER,
    max_hr INTEGER,
    calories REAL,
    elevation_gain_m REAL,
    elevation_loss_m REAL,
    cadence REAL,
    aerobic_te REAL,
    anaerobic_te REAL,
    vo2max REAL,
    training_load REAL,
    avg_power REAL,
    location TEXT,
    event_type TEXT,
    is_pr INTEGER,
    source TEXT,
    synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);

CREATE TABLE IF NOT EXISTS activity_splits (
    activity_id INTEGER NOT NULL,
    lap INTEGER NOT NULL,
    distance_m REAL,
    duration_s REAL,
    moving_s REAL,
    avg_hr INTEGER,
    max_hr INTEGER,
    avg_speed_mps REAL,
    elevation_gain_m REAL,
    elevation_loss_m REAL,
    PRIMARY KEY (activity_id, lap)
);

CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    mode TEXT,
    range_start TEXT,
    range_end TEXT,
    days_requested INTEGER,
    days_fetched INTEGER,
    activities INTEGER,
    splits INTEGER,
    errors INTEGER,
    detail TEXT
);

CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""

DAILY_COLUMNS = (
    "date",
    "steps",
    "distance_m",
    "active_calories",
    "total_calories",
    "floors",
    "resting_hr",
    "min_hr",
    "max_hr",
    "stress_avg",
    "stress_max",
    "spo2_avg",
    "respiration_avg",
    "body_battery_high",
    "body_battery_low",
    "body_battery_wake",
    "body_battery_charged",
    "body_battery_drained",
    "sleep_seconds",
    "sleep_score",
    "deep_sleep_s",
    "light_sleep_s",
    "rem_sleep_s",
    "awake_s",
    "sleep_start",
    "sleep_end",
    "hrv_avg",
    "hrv_weekly_avg",
    "hrv_high",
    "hrv_status",
    "vo2max",
    "synced_at",
)

ACTIVITY_COLUMNS = (
    "id",
    "date",
    "start_time",
    "name",
    "type",
    "distance_m",
    "duration_s",
    "moving_s",
    "elapsed_s",
    "avg_speed_mps",
    "avg_hr",
    "max_hr",
    "calories",
    "elevation_gain_m",
    "elevation_loss_m",
    "cadence",
    "aerobic_te",
    "anaerobic_te",
    "vo2max",
    "training_load",
    "avg_power",
    "location",
    "event_type",
    "is_pr",
    "source",
    "synced_at",
)

SPLIT_COLUMNS = (
    "activity_id",
    "lap",
    "distance_m",
    "duration_s",
    "moving_s",
    "avg_hr",
    "max_hr",
    "avg_speed_mps",
    "elevation_gain_m",
    "elevation_loss_m",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect(db_path: Path | str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Open (and create if needed) the local database."""
    path = Path(db_path)
    if path.parent and str(path.parent) not in ("", "."):
        path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), timeout=30)
    conn.row_factory = sqlite3.Row
    # WAL keeps a long backfill writable while another process reads progress
    # or the dashboard exporter opens the same file.
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA busy_timeout=15000")
    conn.executescript(SCHEMA)
    conn.commit()
    return conn


def _get(obj: Any, *keys: str, default: Any = None) -> Any:
    for key in keys:
        if isinstance(obj, dict) and key in obj:
            obj = obj[key]
        else:
            return default
    return obj


def _num(value: Any) -> Optional[float]:
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return None


def _int(value: Any) -> Optional[int]:
    number = _num(value)
    return int(round(number)) if number is not None else None


def _local_time(value: Any) -> Optional[str]:
    """Convert a Garmin epoch-millis local timestamp into ISO local time."""
    if value is None:
        return None
    try:
        millis = int(value)
    except (TypeError, ValueError):
        return None
    seconds = millis / 1000
    return datetime.fromtimestamp(seconds, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")


def date_range(start: date, end: date) -> Iterable[date]:
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def _extract_vo2max(payload: Any) -> Optional[float]:
    """Pull a running VO2max reading out of max-metrics responses."""
    if isinstance(payload, list):
        for item in payload:
            found = _extract_vo2max(item)
            if found is not None:
                return found
        return None
    if not isinstance(payload, dict):
        return None

    generic = payload.get("generic")
    if isinstance(generic, dict):
        for key in ("vo2MaxPreciseValue", "vo2MaxValue"):
            value = _num(generic.get(key))
            if value:
                return value
    for key in ("vo2MaxPreciseValue", "vo2MaxValue"):
        value = _num(payload.get(key))
        if value:
            return value
    for value in payload.values():
        if isinstance(value, (dict, list)):
            found = _extract_vo2max(value)
            if found is not None:
                return found
    return None


def _daily_row(day: str, stats: Dict[str, Any], sleep: Dict[str, Any], hrv: Dict[str, Any], vo2max: Optional[float]) -> Dict[str, Any]:
    dto = sleep.get("dailySleepDTO") or {}
    hrv_summary = hrv.get("hrvSummary") or {}
    scores = sleep.get("sleepScores") or {}
    overall = scores.get("overall") if isinstance(scores, dict) else None

    return {
        "date": day,
        "steps": _int(stats.get("totalSteps")),
        "distance_m": _num(stats.get("totalDistanceMeters")),
        "active_calories": _num(stats.get("activeKilocalories")),
        "total_calories": _num(stats.get("totalKilocalories")),
        "floors": _int(stats.get("floorsAscended")),
        "resting_hr": _int(stats.get("restingHeartRate")),
        "min_hr": _int(stats.get("minHeartRate")),
        "max_hr": _int(stats.get("maxHeartRate")),
        "stress_avg": _int(stats.get("averageStressLevel")),
        "stress_max": _int(stats.get("maxStressLevel")),
        "spo2_avg": _num(stats.get("averageSpo2")),
        "respiration_avg": _num(stats.get("avgWakingRespirationValue")),
        "body_battery_high": _int(stats.get("bodyBatteryHighestValue")),
        "body_battery_low": _int(stats.get("bodyBatteryLowestValue")),
        "body_battery_wake": _int(stats.get("bodyBatteryAtWakeTime")),
        "body_battery_charged": _int(stats.get("bodyBatteryChargedValue")),
        "body_battery_drained": _int(stats.get("bodyBatteryDrainedValue")),
        "sleep_seconds": _int(dto.get("sleepTimeSeconds")),
        "sleep_score": _int((overall or {}).get("value")) if isinstance(overall, dict) else None,
        "deep_sleep_s": _int(dto.get("deepSleepSeconds")),
        "light_sleep_s": _int(dto.get("lightSleepSeconds")),
        "rem_sleep_s": _int(dto.get("remSleepSeconds")),
        "awake_s": _int(dto.get("awakeSleepSeconds")),
        "sleep_start": _local_time(dto.get("sleepStartTimestampLocal")),
        "sleep_end": _local_time(dto.get("sleepEndTimestampLocal")),
        "hrv_avg": _num(hrv_summary.get("lastNightAvg")),
        "hrv_weekly_avg": _num(hrv_summary.get("weeklyAvg")),
        "hrv_high": _num(hrv_summary.get("lastNight5MinHigh")),
        "hrv_status": hrv_summary.get("status"),
        "vo2max": vo2max,
        "synced_at": utc_now(),
    }


def _activity_row(activity: Dict[str, Any], synced_at: str) -> Dict[str, Any]:
    start = activity.get("startTimeLocal") or ""
    day = start[:10] if len(start) >= 10 else ""
    return {
        "id": _int(activity.get("activityId")),
        "date": day,
        "start_time": start,
        "name": activity.get("activityName"),
        "type": _get(activity, "activityType", "typeKey"),
        "distance_m": _num(activity.get("distance")),
        "duration_s": _num(activity.get("duration")),
        "moving_s": _num(activity.get("movingDuration")),
        "elapsed_s": _num(activity.get("elapsedDuration")),
        "avg_speed_mps": _num(activity.get("averageSpeed")),
        "avg_hr": _int(activity.get("averageHR")),
        "max_hr": _int(activity.get("maxHR")),
        "calories": _num(activity.get("calories")),
        "elevation_gain_m": _num(activity.get("elevationGain")),
        "elevation_loss_m": _num(activity.get("elevationLoss")),
        "cadence": _num(activity.get("averageRunningCadenceInStepsPerMinute")),
        "aerobic_te": _num(activity.get("aerobicTrainingEffect")),
        "anaerobic_te": _num(activity.get("anaerobicTrainingEffect")),
        "vo2max": _num(activity.get("vO2MaxValue")),
        "training_load": _num(activity.get("activityTrainingLoad")),
        "avg_power": _num(activity.get("avgPower")),
        "location": activity.get("locationName"),
        "event_type": _get(activity, "eventType", "typeKey"),
        "is_pr": 1 if activity.get("isPR") else 0,
        "source": "garmin",
        "synced_at": synced_at,
    }


def _upsert(conn: sqlite3.Connection, table: str, columns: Tuple[str, ...], row: Dict[str, Any]) -> None:
    placeholders = ", ".join("?" for _ in columns)
    updates = ", ".join(f"{column}=excluded.{column}" for column in columns if column not in ("date", "id", "activity_id", "lap"))
    sql = (
        f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders}) "
        f"ON CONFLICT DO UPDATE SET {updates}"
    )
    conn.execute(sql, [row.get(column) for column in columns])


def _upsert_daily(conn: sqlite3.Connection, row: Dict[str, Any]) -> None:
    updates = ", ".join(f"{c}=excluded.{c}" for c in DAILY_COLUMNS if c != "date")
    conn.execute(
        f"INSERT INTO daily ({', '.join(DAILY_COLUMNS)}) VALUES ({', '.join('?' for _ in DAILY_COLUMNS)}) "
        f"ON CONFLICT(date) DO UPDATE SET {updates}",
        [row.get(column) for column in DAILY_COLUMNS],
    )


def _upsert_activity(conn: sqlite3.Connection, row: Dict[str, Any]) -> None:
    updates = ", ".join(f"{c}=excluded.{c}" for c in ACTIVITY_COLUMNS if c != "id")
    conn.execute(
        f"INSERT INTO activities ({', '.join(ACTIVITY_COLUMNS)}) VALUES ({', '.join('?' for _ in ACTIVITY_COLUMNS)}) "
        f"ON CONFLICT(id) DO UPDATE SET {updates}",
        [row.get(column) for column in ACTIVITY_COLUMNS],
    )


def _upsert_splits(conn: sqlite3.Connection, activity_id: int, laps: List[Dict[str, Any]]) -> int:
    written = 0
    for index, lap in enumerate(laps, start=1):
        row = {
            "activity_id": activity_id,
            "lap": index,
            "distance_m": _num(lap.get("distance")),
            "duration_s": _num(lap.get("duration")),
            "moving_s": _num(lap.get("movingDuration")),
            "avg_hr": _int(lap.get("averageHR")),
            "max_hr": _int(lap.get("maxHR")),
            "avg_speed_mps": _num(lap.get("averageSpeed")),
            "elevation_gain_m": _num(lap.get("elevationGain")),
            "elevation_loss_m": _num(lap.get("elevationLoss")),
        }
        _upsert(conn, "activity_splits", SPLIT_COLUMNS, row)
        written += 1
    return written


def cached_days(conn: sqlite3.Connection, start: date, end: date) -> set:
    rows = conn.execute(
        "SELECT date FROM daily WHERE date BETWEEN ? AND ?", (start.isoformat(), end.isoformat())
    ).fetchall()
    return {row["date"] for row in rows}


def sync(
    garmin: Any,
    db_path: Path | str = DEFAULT_DB_PATH,
    *,
    days: int = 30,
    start: Optional[date] = None,
    end: Optional[date] = None,
    full: bool = False,
    refresh_days: int = 2,
    include_splits: bool = False,
    split_min_miles: float = 10.0,
    delay: float = 0.35,
    log: Callable[[str], None] = lambda _msg: None,
) -> Dict[str, Any]:
    """Pull wellness + activity data into the local database.

    Returns a summary dict describing what was written.
    """
    conn = connect(db_path)
    end_day = end or date.today()
    start_day = start or (end_day - timedelta(days=max(days, 1) - 1))

    started_at = utc_now()
    errors: List[str] = []
    fetched = 0
    activity_count = 0
    split_count = 0

    refresh_after = (
        end_day - timedelta(days=refresh_days - 1) if refresh_days > 0 else None
    )
    have = cached_days(conn, start_day, end_day)
    wanted = [
        day
        for day in date_range(start_day, end_day)
        if full
        or day.isoformat() not in have
        or (refresh_after is not None and day >= refresh_after)
    ]

    log(
        f"Syncing {start_day} -> {end_day}: {len(wanted)} of "
        f"{(end_day - start_day).days + 1} days need fetching"
    )

    for day in wanted:
        day_str = day.isoformat()
        stats: Dict[str, Any] = {}
        sleep: Dict[str, Any] = {}
        hrv: Dict[str, Any] = {}
        vo2max: Optional[float] = None

        try:
            stats = garmin.get_stats(day_str) or {}
        except Exception as exc:  # noqa: BLE001 - one bad endpoint must not kill the sync
            errors.append(f"{day_str} stats: {exc}")
        if delay:
            time.sleep(delay)

        try:
            sleep = garmin.get_sleep_data(day_str) or {}
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{day_str} sleep: {exc}")
        if delay:
            time.sleep(delay)

        try:
            hrv = garmin.get_hrv_data(day_str) or {}
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{day_str} hrv: {exc}")
        if delay:
            time.sleep(delay)

        # VO2max moves slowly, so probe it weekly rather than every day.
        if day.weekday() == 0 or full:
            try:
                vo2max = _extract_vo2max(garmin.get_max_metrics(day_str))
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{day_str} vo2max: {exc}")
            if delay:
                time.sleep(delay)
        _upsert_daily(conn, _daily_row(day_str, stats, sleep, hrv, vo2max))
        fetched += 1
        if fetched % 10 == 0:
            conn.commit()
            log(f"  {fetched}/{len(wanted)} days cached")

    # Activities are one call for the whole window, so always refresh them.
    try:
        activities = garmin.get_activities_by_date(start_day.isoformat(), end_day.isoformat()) or []
    except Exception as exc:  # noqa: BLE001
        activities = []
        errors.append(f"activities: {exc}")

    synced_at = utc_now()
    for activity in activities:
        row = _activity_row(activity, synced_at)
        if not row["id"] or not row["date"]:
            continue
        _upsert_activity(conn, row)
        activity_count += 1

    if include_splits:
        runs = [
            row
            for row in activities
            if str(_get(row, "activityType", "typeKey") or "").find("run") >= 0
            and (_num(row.get("distance")) or 0) >= split_min_miles * 1609.344
        ]
        for activity in runs:
            activity_id = _int(activity.get("activityId"))
            if activity_id is None:
                continue
            try:
                payload = garmin.get_activity_splits(activity_id) or {}
                laps = payload.get("lapDTOs") or []
                split_count += _upsert_splits(conn, activity_id, laps)
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{activity_id} splits: {exc}")
            if delay:
                time.sleep(delay)
            log(f"  splits {activity_id}")

    finished_at = utc_now()
    conn.execute(
        "INSERT INTO sync_log (started_at, finished_at, mode, range_start, range_end, days_requested, "
        "days_fetched, activities, splits, errors, detail) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (
            started_at,
            finished_at,
            "full" if full else "incremental",
            start_day.isoformat(),
            end_day.isoformat(),
            (end_day - start_day).days + 1,
            fetched,
            activity_count,
            split_count,
            len(errors),
            "\n".join(errors[:50]) if errors else None,
        ),
    )
    conn.execute(
        "INSERT INTO meta (key, value) VALUES ('last_sync', ?) "
        "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        (finished_at,),
    )
    conn.commit()

    summary = {
        "started_at": started_at,
        "finished_at": finished_at,
        "range": [start_day.isoformat(), end_day.isoformat()],
        "days_requested": (end_day - start_day).days + 1,
        "days_fetched": fetched,
        "activities": activity_count,
        "splits": split_count,
        "errors": errors,
        "db": str(db_path),
    }
    return summary


def _table_rows(conn: sqlite3.Connection, table: str, order_by: str) -> List[Dict[str, Any]]:
    rows = conn.execute(f"SELECT * FROM {table} ORDER BY {order_by}").fetchall()
    return [dict(row) for row in rows]


def export_snapshot(
    conn: sqlite3.Connection,
    out_path: Path | str = DEFAULT_EXPORT_PATH,
    *,
    include_splits: bool = True,
) -> Dict[str, Any]:
    """Write a compact JSON snapshot used by the static web dashboard."""
    path = Path(out_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    daily = _table_rows(conn, "daily", "date")
    activities = _table_rows(conn, "activities", "start_time")

    splits: Dict[str, List[Dict[str, Any]]] = {}
    if include_splits:
        for row in conn.execute(
            "SELECT * FROM activity_splits ORDER BY activity_id, lap"
        ).fetchall():
            splits.setdefault(str(row["activity_id"]), []).append(dict(row))

    last_sync_row = conn.execute("SELECT value FROM meta WHERE key='last_sync'").fetchone()

    payload = {
        "generated_at": utc_now(),
        "source": "garmin-connect",
        "last_sync": last_sync_row["value"] if last_sync_row else None,
        "counts": {
            "days": len(daily),
            "activities": len(activities),
            "split_sets": len(splits),
        },
        "daily": daily,
        "activities": activities,
        "splits": splits,
    }

    path.write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    return {"path": str(path), "bytes": path.stat().st_size, "counts": payload["counts"]}


def load_snapshot(path: Path | str = DEFAULT_EXPORT_PATH) -> Dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def coverage(conn: sqlite3.Connection) -> Dict[str, Any]:
    """Small stats block for CLI output and the dashboard header."""
    row = conn.execute(
        "SELECT MIN(date) AS first_day, MAX(date) AS last_day, COUNT(*) AS days FROM daily"
    ).fetchone()
    activities = conn.execute("SELECT COUNT(*) AS n, MAX(date) AS last_activity FROM activities").fetchone()
    last_sync = conn.execute("SELECT value FROM meta WHERE key='last_sync'").fetchone()
    return {
        "first_day": row["first_day"],
        "last_day": row["last_day"],
        "days": row["days"],
        "activities": activities["n"],
        "last_activity": activities["last_activity"],
        "last_sync": last_sync["value"] if last_sync else None,
    }
