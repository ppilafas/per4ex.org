#!/usr/bin/env python3
"""
Realtime watcher — prints ONE line whenever a watched GA4 event's count rises.
Designed to be run UNDER THE MONITOR TOOL so each line becomes a live
notification to the agent.

    GA4_PROPERTY_ID=123456789 python scripts/ga4/watch_realtime.py

(or pass the property id as argv[1]). Realtime lag is seconds–~1 min — never
use the standard report for "did it just fire".
"""
import json
import os
import sys
import time

from google.oauth2.credentials import Credentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    Dimension, Metric, RunRealtimeReportRequest,
)

from _paths import OAUTH_JSON, WATCH_EVENTS

POLL_SECONDS = 30


def main() -> int:
    property_id = (sys.argv[1] if len(sys.argv) > 1
                   else os.environ.get("GA4_PROPERTY_ID", "")).strip()
    if not property_id:
        print("ERROR: set GA4_PROPERTY_ID (run find_property.py).",
              file=sys.stderr, flush=True)
        return 1
    if not OAUTH_JSON.exists():
        print(f"ERROR: {OAUTH_JSON} not found — run mint_token.py first.",
              file=sys.stderr, flush=True)
        return 1

    d = json.loads(OAUTH_JSON.read_text())
    creds = Credentials(
        token=None, refresh_token=d["refresh_token"],
        client_id=d["client_id"], client_secret=d["client_secret"],
        token_uri=d["token_uri"], scopes=d["scopes"],
    )
    client = BetaAnalyticsDataClient(credentials=creds)
    print(f"GA4 watch started: property={property_id} "
          f"events={sorted(WATCH_EVENTS)}", flush=True)

    seen: dict[str, int] = {}
    while True:
        try:
            r = client.run_realtime_report(RunRealtimeReportRequest(
                property=f"properties/{property_id}",
                dimensions=[Dimension(name="eventName")],
                metrics=[Metric(name="eventCount")],
            ))
            for row in r.rows:
                name = row.dimension_values[0].value
                cnt = int(row.metric_values[0].value)
                if name in WATCH_EVENTS and cnt > seen.get(name, 0):
                    print(f"GA4 fired: {name} (+{cnt - seen.get(name, 0)})",
                          flush=True)
                seen[name] = cnt
        except Exception as e:  # noqa: BLE001 — watcher must never die silently
            print(f"poll error: {e}", flush=True)
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())
