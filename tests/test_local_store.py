"""Unit tests for the local SQLite cache."""

from datetime import date

import pytest

from garmin_mcp.local_store import connect, coverage, export_snapshot, sync


class FakeGarmin:
    """Minimal stand-in for the parts of Garmin the sync touches."""

    def __init__(self):
        self.calls = []

    def get_stats(self, day):
        self.calls.append(("stats", day))
        return {
            "calendarDate": day,
            "totalSteps": 8200,
            "totalDistanceMeters": 6100,
            "activeKilocalories": 320,
            "totalKilocalories": 2200,
            "floorsAscended": 14,
            "restingHeartRate": 48,
            "minHeartRate": 44,
            "maxHeartRate": 172,
            "averageStressLevel": 22,
            "maxStressLevel": 91,
            "averageSpo2": 96.0,
            "avgWakingRespirationValue": 13.4,
            "bodyBatteryHighestValue": 94,
            "bodyBatteryLowestValue": 21,
            "bodyBatteryAtWakeTime": 88,
            "bodyBatteryChargedValue": 66,
            "bodyBatteryDrainedValue": 40,
        }

    def get_sleep_data(self, day):
        self.calls.append(("sleep", day))
        return {
            "dailySleepDTO": {
                "sleepTimeSeconds": 26400,
                "deepSleepSeconds": 5400,
                "lightSleepSeconds": 16200,
                "remSleepSeconds": 4800,
                "awakeSleepSeconds": 1200,
                "sleepStartTimestampLocal": 1794788233000,
                "sleepEndTimestampLocal": 1794819973000,
            }
        }

    def get_hrv_data(self, day):
        self.calls.append(("hrv", day))
        return {
            "hrvSummary": {
                "lastNightAvg": 54,
                "weeklyAvg": 51,
                "lastNight5MinHigh": 82,
                "status": "BALANCED",
            }
        }

    def get_max_metrics(self, day):
        self.calls.append(("max_metrics", day))
        return [{"generic": {"vo2MaxPreciseValue": 51.4}}]

    def get_activities_by_date(self, start, end):
        self.calls.append(("activities", start, end))
        return [
            {
                "activityId": 123,
                "activityName": "Morning Run",
                "activityType": {"typeKey": "running"},
                "startTimeLocal": "2026-11-14 07:10:00",
                "distance": 21097.0,
                "duration": 6100.0,
                "movingDuration": 6020.0,
                "elapsedDuration": 6300.0,
                "averageSpeed": 3.45,
                "averageHR": 165,
                "maxHR": 181,
                "calories": 1400,
                "elevationGain": 120.0,
                "elevationLoss": 110.0,
                "averageRunningCadenceInStepsPerMinute": 172.0,
                "aerobicTrainingEffect": 3.9,
                "anaerobicTrainingEffect": 0.4,
                "vO2MaxValue": 51.0,
                "activityTrainingLoad": 180.0,
                "avgPower": 320.0,
                "locationName": "Richmond",
                "eventType": {"typeKey": "race"},
                "isPR": True,
            }
        ]

    def get_activity_splits(self, activity_id):
        self.calls.append(("splits", activity_id))
        return {
            "lapDTOs": [
                {"distance": 1609.34, "duration": 380.0, "averageHR": 160, "elevationGain": 5.0},
                {"distance": 1609.34, "duration": 376.0, "averageHR": 168, "elevationGain": 8.0},
            ]
        }


@pytest.fixture
def fake_client():
    return FakeGarmin()


def test_sync_writes_daily_and_activity(tmp_path, fake_client):
    db_path = tmp_path / "garmin.db"
    summary = sync(
        fake_client,
        db_path,
        days=2,
        end=date(2026, 11, 15),
        delay=0,
        include_splits=True,
        split_min_miles=10,
    )

    assert summary["days_fetched"] == 2
    assert summary["activities"] == 1
    assert summary["splits"] == 2

    conn = connect(db_path)
    day = conn.execute("SELECT * FROM daily WHERE date = '2026-11-15'").fetchone()
    assert day["resting_hr"] == 48
    assert day["sleep_seconds"] == 26400
    assert day["hrv_avg"] == 54
    assert day["hrv_status"] == "BALANCED"
    assert day["body_battery_high"] == 94

    activity = conn.execute("SELECT * FROM activities WHERE id = 123").fetchone()
    assert activity["date"] == "2026-11-14"
    assert activity["type"] == "running"
    assert activity["avg_hr"] == 165
    assert activity["is_pr"] == 1

    laps = conn.execute(
        "SELECT * FROM activity_splits WHERE activity_id = 123 ORDER BY lap"
    ).fetchall()
    assert [lap["lap"] for lap in laps] == [1, 2]

    info = coverage(conn)
    assert info["days"] == 2
    assert info["activities"] == 1


def test_incremental_sync_skips_cached_days(tmp_path, fake_client):
    db_path = tmp_path / "garmin.db"
    window = dict(start=date(2026, 11, 13), end=date(2026, 11, 15))
    sync(fake_client, db_path, delay=0, **window)

    fake_client.calls.clear()
    summary = sync(fake_client, db_path, delay=0, refresh_days=0, **window)

    assert summary["days_fetched"] == 0
    assert [call for call in fake_client.calls if call[0] == "stats"] == []

    # A full re-sync forces the fetch regardless of the cache.
    forced = sync(fake_client, db_path, delay=0, full=True, **window)
    assert forced["days_fetched"] == 3


def test_export_snapshot_round_trip(tmp_path, fake_client):
    db_path = tmp_path / "garmin.db"
    out_path = tmp_path / "garmin.json"
    sync(fake_client, db_path, delay=0, end=date(2026, 11, 15), days=1)

    result = export_snapshot(connect(db_path), out_path)

    assert result["counts"] == {"days": 1, "activities": 1, "split_sets": 0}
    payload = __import__("json").loads(out_path.read_text(encoding="utf-8"))
    assert payload["counts"]["activities"] == 1
    assert payload["daily"][0]["date"] == "2026-11-15"
