#!/usr/bin/env python3
"""
Discover the GA4 *Property ID* (NOT the Stream ID — different numbers; the
Data/Admin API needs the property ID or you get PERMISSION_DENIED).

Run after mint_token.py:
    python scripts/ga4/find_property.py
Copy the numeric ID for the "Supercore Web" property into GA4_PROPERTY_ID.
"""
import json
import sys

from google.oauth2.credentials import Credentials
from google.analytics.admin import AnalyticsAdminServiceClient

from _paths import OAUTH_JSON


def main() -> int:
    if not OAUTH_JSON.exists():
        print(f"ERROR: {OAUTH_JSON} not found — run mint_token.py first.",
              file=sys.stderr)
        return 1

    d = json.loads(OAUTH_JSON.read_text())
    creds = Credentials(
        token=None, refresh_token=d["refresh_token"],
        client_id=d["client_id"], client_secret=d["client_secret"],
        token_uri=d["token_uri"], scopes=d["scopes"],
    )
    client = AnalyticsAdminServiceClient(credentials=creds)

    found = False
    for acct in client.list_account_summaries():
        for p in acct.property_summaries:
            found = True
            # p.property == "properties/123456789"
            pid = p.property.split("/")[-1]
            print(f"{pid:>12}  {p.display_name}  (account: {acct.display_name})")
    if not found:
        print("No properties visible. Check the account you consented with, "
              "and that analyticsadmin.googleapis.com is enabled.",
              file=sys.stderr)
        return 1
    print("\n→ Use the numeric ID of 'Supercore Web' as GA4_PROPERTY_ID.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
