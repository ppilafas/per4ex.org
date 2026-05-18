#!/usr/bin/env python3
"""
Pull the smoke-test numbers: campaign totals + per-COUNTRY breakdown
(impressions, clicks, CTR, cost, conversions) for the last N days.

    python scripts/ads/pull_report.py [days]      # default 7

Read this, not raw click counts, to make the geo decision: country rows
are sorted by impressions (demand signal, less CPC-distorted than clicks).
"""
import sys

from _config import build_client, CUSTOMER_ID


def _rows(client, query):
    svc = client.get_service("GoogleAdsService")
    for batch in svc.search_stream(customer_id=CUSTOMER_ID, query=query):
        for row in batch.results:
            yield row


def main() -> int:
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    client = build_client()
    during = f"LAST_{days}_DAYS" if days in (7, 14, 30) else None
    where = (f"segments.date DURING {during}" if during
             else f"segments.date >= '{_n_days_ago(days)}'")

    print(f"=== Campaign totals (last {days}d) ===", flush=True)
    for r in _rows(client, f"""
        SELECT campaign.name, metrics.impressions, metrics.clicks,
               metrics.ctr, metrics.cost_micros, metrics.conversions
        FROM campaign WHERE {where}"""):
        m = r.metrics
        print(f"{r.campaign.name}: impr={m.impressions} clicks={m.clicks} "
              f"ctr={m.ctr:.4f} cost=€{m.cost_micros/1e6:.2f} "
              f"conv={m.conversions:.2f}", flush=True)

    # Per-country. country_criterion_id -> resolve names.
    geo = list(_rows(client, f"""
        SELECT geographic_view.country_criterion_id,
               metrics.impressions, metrics.clicks, metrics.ctr,
               metrics.cost_micros, metrics.conversions
        FROM geographic_view WHERE {where}"""))
    ids = {str(g.geographic_view.country_criterion_id) for g in geo}
    names = {}
    if ids:
        for r in _rows(client, f"""
            SELECT geo_target_constant.id, geo_target_constant.name
            FROM geo_target_constant
            WHERE geo_target_constant.id IN ({','.join(ids)})"""):
            names[str(r.geo_target_constant.id)] = r.geo_target_constant.name

    print(f"\n=== By country (last {days}d, sorted by impressions) ===", flush=True)
    for g in sorted(geo, key=lambda x: x.metrics.impressions, reverse=True):
        cid = str(g.geographic_view.country_criterion_id)
        m = g.metrics
        print(f"{names.get(cid, cid):<24} impr={m.impressions:<6} "
              f"clicks={m.clicks:<4} ctr={m.ctr:.4f} "
              f"cost=€{m.cost_micros/1e6:<7.2f} conv={m.conversions:.2f}",
              flush=True)
    return 0


def _n_days_ago(days: int) -> str:
    import datetime
    return (datetime.date.today() - datetime.timedelta(days=days)).isoformat()


if __name__ == "__main__":
    raise SystemExit(main())
