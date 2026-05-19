#!/usr/bin/env python3
"""
Pull the smoke-test numbers from GA4 (Data API, processed reports).

    python scripts/ga4/pull_report.py [days]      # default 7

Note: GA4 processed data lags ~24-48h, so the most recent day is partial.
The realtime watcher (watch_realtime.py) remains the source of truth for
"did it just fire". This is for the accumulated picture.
"""
import sys
import json

from google.oauth2.credentials import Credentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression,
)

from _paths import OAUTH_JSON

PROPERTY = "properties/538196814"
WATCH = ["qualified_enquiry", "assistant_open", "email_click", "page_view"]


def client():
    d = json.loads(OAUTH_JSON.read_text())
    creds = Credentials(
        token=None, refresh_token=d["refresh_token"],
        client_id=d["client_id"], client_secret=d["client_secret"],
        token_uri=d["token_uri"], scopes=d["scopes"])
    return BetaAnalyticsDataClient(credentials=creds)


def run(c, dims, mets, dr, dim_filter=None, limit=25):
    req = RunReportRequest(
        property=PROPERTY,
        date_ranges=[dr],
        dimensions=[Dimension(name=d) for d in dims],
        metrics=[Metric(name=m) for m in mets],
        dimension_filter=dim_filter,
        limit=limit,
    )
    return c.run_report(req)


def main() -> int:
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    c = client()
    dr = DateRange(start_date=f"{days}daysAgo", end_date="today")

    print(f"=== Totals (last {days}d, last day partial) ===", flush=True)
    r = run(c, [], ["sessions", "totalUsers", "screenPageViews", "keyEvents"], dr)
    for row in r.rows:
        v = row.metric_values
        print(f"sessions={v[0].value} users={v[1].value} "
              f"pageviews={v[2].value} key_events={v[3].value}", flush=True)

    print("\n=== By source / medium / campaign ===", flush=True)
    r = run(c, ["sessionSource", "sessionMedium", "sessionCampaignName"],
            ["sessions", "keyEvents"], dr)
    for row in r.rows:
        d = [x.value for x in row.dimension_values]
        v = [x.value for x in row.metric_values]
        print(f"{d[0]:<14} / {d[1]:<10} / {d[2]:<22} "
              f"sessions={v[0]:<5} key_events={v[1]}", flush=True)

    print("\n=== Key events (counts) ===", flush=True)
    r = run(c, ["eventName"], ["eventCount"], dr,
            dim_filter=FilterExpression(filter=Filter(
                field_name="eventName",
                in_list_filter=Filter.InListFilter(values=WATCH))))
    for row in r.rows:
        print(f"{row.dimension_values[0].value:<20} "
              f"{row.metric_values[0].value}", flush=True)

    print("\n=== By country (sessions, sorted) ===", flush=True)
    r = run(c, ["country"], ["sessions", "keyEvents"], dr, limit=15)
    for row in sorted(r.rows, key=lambda x: int(x.metric_values[0].value),
                      reverse=True):
        d = [x.value for x in row.dimension_values]
        v = [x.value for x in row.metric_values]
        print(f"{d[0]:<22} sessions={v[0]:<5} key_events={v[1]}", flush=True)

    print("\n=== Landing pages containing /private-ai ===", flush=True)
    r = run(c, ["landingPagePlusQueryString"], ["sessions", "keyEvents"], dr,
            dim_filter=FilterExpression(filter=Filter(
                field_name="landingPagePlusQueryString",
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.CONTAINS,
                    value="private-ai"))))
    for row in r.rows:
        d = row.dimension_values[0].value
        v = [x.value for x in row.metric_values]
        print(f"{d[:60]:<60} sessions={v[0]:<5} key_events={v[1]}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
