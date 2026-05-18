"""Shared paths. All credentials live under the gitignored local/ga4/ dir."""
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CREDS_DIR = Path(os.environ.get("GA4_CREDS_DIR", REPO_ROOT / "local" / "ga4"))

CLIENT_SECRET = Path(os.environ.get("GA4_CLIENT_SECRET", CREDS_DIR / "client_secret.json"))
OAUTH_JSON = Path(os.environ.get("GA4_OAUTH_JSON", CREDS_DIR / "ga4-oauth.json"))

# GA4 web stream for supercore.tech (Measurement ID, for reference only —
# the Data API needs the *property* ID, discovered via find_property.py).
MEASUREMENT_ID = "G-GH1VHWNT3L"

# Events worth a live notification for the private-ai smoke test.
WATCH_EVENTS = {"qualified_enquiry", "assistant_open", "email_click"}
