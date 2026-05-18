"""Shared config for the Google Ads API scripts.

Reuses the SAME OAuth desktop client minted for GA4 (local/ga4/client_secret.json)
— only the scope differs (adwords vs analytics.readonly). The Ads-scoped
refresh token + the developer token / customer id live in gitignored local/ads/.
"""
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# Reuse the existing desktop OAuth client (created for GA4).
CLIENT_SECRET = Path(os.environ.get(
    "ADS_CLIENT_SECRET", REPO_ROOT / "local" / "ga4" / "client_secret.json"))

ADS_DIR = REPO_ROOT / "local" / "ads"
OAUTH_JSON = Path(os.environ.get("ADS_OAUTH_JSON", ADS_DIR / "ads-oauth.json"))
# key=value file (gitignored) for the two human-supplied values.
ENV_FILE = ADS_DIR / "ads.env"

SCOPES = ["https://www.googleapis.com/auth/adwords"]


def _load_env_file() -> None:
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


_load_env_file()

# Required (from Google Ads API Center / account):
DEVELOPER_TOKEN = os.environ.get("ADS_DEVELOPER_TOKEN", "")
CUSTOMER_ID = os.environ.get("ADS_CUSTOMER_ID", "").replace("-", "")  # 10 digits, no dashes
LOGIN_CUSTOMER_ID = os.environ.get("ADS_LOGIN_CUSTOMER_ID", "").replace("-", "")  # MCC, optional

# Kill / scale thresholds for the smoke test (overridable via env).
KILL_SPEND_EUR = float(os.environ.get("ADS_KILL_SPEND_EUR", "50"))
SCALE_CONVERSIONS = float(os.environ.get("ADS_SCALE_CONVERSIONS", "1"))


def build_client():
    """Construct a GoogleAdsClient from the stored creds."""
    import json
    from google.ads.googleads.client import GoogleAdsClient

    if not OAUTH_JSON.exists():
        raise SystemExit(f"{OAUTH_JSON} missing — run mint_token.py first.")
    if not DEVELOPER_TOKEN:
        raise SystemExit("ADS_DEVELOPER_TOKEN not set (see scripts/ads/README.md §1).")
    if not CUSTOMER_ID:
        raise SystemExit("ADS_CUSTOMER_ID not set (the 10-digit account id).")

    d = json.loads(OAUTH_JSON.read_text())
    cfg = {
        "developer_token": DEVELOPER_TOKEN,
        "client_id": d["client_id"],
        "client_secret": d["client_secret"],
        "refresh_token": d["refresh_token"],
        "use_proto_plus": True,
    }
    if LOGIN_CUSTOMER_ID:
        cfg["login_customer_id"] = LOGIN_CUSTOMER_ID
    return GoogleAdsClient.load_from_dict(cfg)
