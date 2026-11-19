"""CLI for the local Garmin data cache.

Examples
--------
Backfill the last 90 days and refresh the dashboard snapshot::

    uv run garmin-sync --days 90

Pull one season, including lap splits for runs of 10 miles or more::

    uv run garmin-sync --since 2026-06-01 --until 2026-11-17 --splits

Re-download a window that is already cached::

    uv run garmin-sync --since 2026-10-01 --full

Print what is cached without touching the network::

    uv run garmin-sync --status
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

from .local_store import (
    DEFAULT_DB_PATH,
    DEFAULT_EXPORT_PATH,
    connect,
    coverage,
    export_snapshot,
    sync,
)


def _parse_date(value: str) -> date:
    return date.fromisoformat(value)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="garmin-sync",
        description="Sync Garmin Connect data into a local SQLite cache and export a JSON snapshot.",
    )
    parser.add_argument("--db", default=str(DEFAULT_DB_PATH), help="SQLite file (default: data/garmin.db)")
    parser.add_argument(
        "--export",
        default=str(DEFAULT_EXPORT_PATH),
        help="JSON snapshot path for the web dashboard (default: web/public/data/garmin.json)",
    )
    parser.add_argument("--no-export", action="store_true", help="Skip the JSON snapshot")
    parser.add_argument("--days", type=int, default=30, help="Days back from --until/today (default: 30)")
    parser.add_argument("--since", type=_parse_date, help="Explicit start date (YYYY-MM-DD)")
    parser.add_argument("--until", type=_parse_date, help="Explicit end date (YYYY-MM-DD)")
    parser.add_argument("--full", action="store_true", help="Re-fetch days that are already cached")
    parser.add_argument(
        "--refresh-days",
        type=int,
        default=2,
        help="Always re-fetch the last N days because Garmin finalizes them late (default: 2)",
    )
    parser.add_argument("--splits", action="store_true", help="Also cache lap splits for runs")
    parser.add_argument(
        "--split-min-miles",
        type=float,
        default=10.0,
        help="Minimum run distance for split caching (default: 10)",
    )
    parser.add_argument("--delay", type=float, default=0.35, help="Seconds between API calls (default: 0.35)")
    parser.add_argument("--status", action="store_true", help="Print cache coverage and exit")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    if args.status:
        conn = connect(args.db)
        info = coverage(conn)
        print(f"database : {Path(args.db).resolve()}")
        print(f"days     : {info['days']} ({info['first_day']} -> {info['last_day']})")
        print(f"activities: {info['activities']} (last: {info['last_activity']})")
        print(f"last sync: {info['last_sync']}")
        return 0

    from garminconnect import Garmin

    from .token_utils import get_token_path

    garmin = Garmin()
    garmin.login(get_token_path())

    summary = sync(
        garmin,
        args.db,
        days=args.days,
        start=args.since,
        end=args.until,
        full=args.full,
        refresh_days=args.refresh_days,
        include_splits=args.splits,
        split_min_miles=args.split_min_miles,
        delay=args.delay,
        log=lambda message: print(message),
    )

    print(
        f"cached {summary['days_fetched']}/{summary['days_requested']} days, "
        f"{summary['activities']} activities, {summary['splits']} splits"
    )

    if summary["errors"]:
        print(f"{len(summary['errors'])} endpoint errors (first 5):", file=sys.stderr)
        for error in summary["errors"][:5]:
            print(f"  - {error}", file=sys.stderr)

    if not args.no_export:
        conn = connect(args.db)
        result = export_snapshot(conn, args.export, include_splits=True)
        print(
            f"exported {result['path']} "
            f"({result['bytes'] / 1024:.0f} KB, {result['counts']['activities']} activities)"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
