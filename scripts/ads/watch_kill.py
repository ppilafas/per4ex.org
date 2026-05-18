#!/usr/bin/env python3
"""
Kill/scale-criteria watcher — run UNDER THE MONITOR TOOL.

Emits a line only when an action threshold for the smoke test is crossed:
  - KILL  : cumulative cost >= ADS_KILL_SPEND_EUR AND conversions == 0
  - SCALE : conversions >= ADS_SCALE_CONVERSIONS
  - a daily geo top-3 summary line (the input for the geo decision)

Google Ads metrics lag ~hours (NOT realtime — unlike the GA4 watcher), so
this polls slowly. Pair with the GA4 realtime watcher for fast conversion
signal; this one is for the spend-side action rules.

    ADS_DEVELOPER_TOKEN=... ADS_CUSTOMER_ID=... \
      python scripts/ads/watch_kill.py
"""
import time

from _config import build_client, CUSTOMER_ID, KILL_SPEND_EUR, SCALE_CONVERSIONS

POLL_SECONDS = 1800  # 30 min — Ads data lags hours; faster is pointless


def snapshot(client):
    svc = client.get_service("GoogleAdsService")
    cost = conv = 0.0
    for batch in svc.search_stream(customer_id=CUSTOMER_ID, query="""
        SELECT metrics.cost_micros, metrics.conversions
        FROM campaign WHERE segments.date DURING LAST_14_DAYS"""):
        for r in batch.results:
            cost += r.metrics.cost_micros / 1e6
            conv += r.metrics.conversions
    top = []
    for batch in svc.search_stream(customer_id=CUSTOMER_ID, query="""
        SELECT geographic_view.country_criterion_id, metrics.impressions
        FROM geographic_view WHERE segments.date DURING LAST_7_DAYS"""):
        for r in batch.results:
            top.append((r.geographic_view.country_criterion_id,
                        r.metrics.impressions))
    top.sort(key=lambda x: x[1], reverse=True)
    return cost, conv, top[:3]


def main() -> int:
    client = build_client()
    print(f"Ads kill-watch started: kill>=€{KILL_SPEND_EUR} & 0 conv | "
          f"scale>={SCALE_CONVERSIONS} conv", flush=True)
    killed = scaled = False
    while True:
        try:
            cost, conv, top = snapshot(client)
            print(f"Ads status: cost=€{cost:.2f} conv={conv:.2f} "
                  f"top_geo(criterionId:impr)={top}", flush=True)
            if not killed and cost >= KILL_SPEND_EUR and conv == 0:
                print(f"KILL TRIGGERED: €{cost:.2f} spent, 0 conversions — "
                      f"pause/rework per pre-registered rule.", flush=True)
                killed = True
            if not scaled and conv >= SCALE_CONVERSIONS:
                print(f"SCALE SIGNAL: {conv:.2f} conversions — angle works, "
                      f"consider scaling/geo-expanding.", flush=True)
                scaled = True
        except Exception as e:  # noqa: BLE001 — never die silently
            print(f"poll error: {e}", flush=True)
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    raise SystemExit(main())
