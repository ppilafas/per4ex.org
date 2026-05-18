#!/usr/bin/env python3
"""
Mint an `adwords`-scoped refresh token, REUSING the GA4 desktop OAuth client.
Same browser-consent pattern as scripts/ga4/mint_token.py (different scope).

    local/ga4/.venv/bin/python scripts/ads/mint_token.py     # (or the ads venv)

Open the printed URL in the browser signed into the Google account that has
access to the Google Ads account. Writes local/ads/ads-oauth.json.
"""
import json
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

from _config import CLIENT_SECRET, OAUTH_JSON, SCOPES

PORT = 8766  # different port than the GA4 mint (8765)


def main() -> int:
    if not CLIENT_SECRET.exists():
        print(f"ERROR: {CLIENT_SECRET} not found (the GA4 desktop client).",
              file=sys.stderr)
        return 1
    cs = json.loads(CLIENT_SECRET.read_text())
    node = cs.get("installed") or cs.get("web")
    client_id, client_secret = node["client_id"], node["client_secret"]

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), scopes=SCOPES)
    creds = flow.run_local_server(
        host="localhost", port=PORT, open_browser=False,
        authorization_prompt_message=(
            "\n>>> Open this URL in the browser signed into the "
            "Google Ads account:\n{url}\n"),
    )

    OAUTH_JSON.parent.mkdir(parents=True, exist_ok=True)
    OAUTH_JSON.write_text(json.dumps({
        "type": "authorized_user",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": creds.refresh_token,
        "token_uri": "https://oauth2.googleapis.com/token",
        "scopes": SCOPES,
    }, indent=2))
    print(f"\nOK: wrote {OAUTH_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
