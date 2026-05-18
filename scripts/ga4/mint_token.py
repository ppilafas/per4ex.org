#!/usr/bin/env python3
"""
Mint an analytics.readonly refresh token by REUSING an existing, already-
consented installed/desktop OAuth client.

Prereq: local/ga4/client_secret.json downloaded from a Google Cloud OAuth 2.0
"Desktop app" client (see scripts/ga4/README.md).

Run on your LOCAL machine (you have a browser there):
    python scripts/ga4/mint_token.py
It prints a URL — open it in the browser signed into the Google account that
OWNS the GA4 property, approve, done. Writes local/ga4/ga4-oauth.json.
"""
import json
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

from _paths import CLIENT_SECRET, OAUTH_JSON

SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
PORT = 8765


def main() -> int:
    if not CLIENT_SECRET.exists():
        print(f"ERROR: {CLIENT_SECRET} not found.\n"
              f"Create a Desktop OAuth client and save its JSON there "
              f"(see scripts/ga4/README.md §1).", file=sys.stderr)
        return 1

    cs = json.loads(CLIENT_SECRET.read_text())
    node = cs.get("installed") or cs.get("web")
    if not node:
        print("ERROR: client_secret.json is not an installed/desktop client.",
              file=sys.stderr)
        return 1
    client_id, client_secret = node["client_id"], node["client_secret"]

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), scopes=SCOPES)
    # open_browser=False: never open the host's default Google session (wrong
    # account). Open the printed URL yourself in the GA4-owning account.
    creds = flow.run_local_server(
        host="localhost",
        port=PORT,
        open_browser=False,
        authorization_prompt_message=(
            "\n>>> Open this URL in the browser signed into the "
            "GA4-owning Google account:\n{url}\n"
        ),
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
