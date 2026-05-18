# GA4 "Notify When It Fires" — Portable Agent Handoff

A self-contained guide for a Claude agent in **any** project that needs to be
**automatically notified the moment a GA4 event fires**. Copy this file into the
target project as-is; fill in the `<PLACEHOLDERS>`.

---

## 0. The one core insight

**GA4 has no push / no webhook.** There is no "call my URL when an event
arrives." So "notify on fire" is always: **a process that emits one stdout line
per event, run under the `Monitor` tool** (not `Bash`). The Monitor tool turns
every new stdout line into a chat notification, so the agent keeps working and
gets pinged per event.

Pick a case:

- **Case A — server-side events** (backend sends via Measurement Protocol):
  tail the backend log under Monitor. Real push, lowest latency. Preferred.
- **Case B — browser events** (gtag in the page, never touches your backend):
  poll the GA4 **Realtime** Data API under Monitor. Only option; ~secs–1min lag.

---

## 1. Fill these in first

```
<HOST>                SSH host running the backend (Case A)
<BACKEND_LOG>         Absolute path to the log file the backend writes (Case A)
<SUCCESS_SIGNATURE>   Log substring on successful send   e.g. ga4.event_sent
<FAILURE_SIGNATURE>   Log substring on send failure      e.g. ga4.event_exception
<PROPERTY_ID>         GA4 *property* ID (numeric) — NOT the stream ID (Case B)
<WATCH_EVENTS>        Event names to watch e.g. qualified_enquiry, sign_up
<OAUTH_JSON>          Path to the authorized_user creds JSON (Case B) e.g. ./ga4-oauth.json
<CLIENT_SECRETS>      Path to an EXISTING consented installed/desktop OAuth client
```

---

## 2. Case A — server-side events: log-tail + Monitor

**Prereq:** the backend must log one line per send. If it doesn't, adding that
single line is the cheapest fix. Log **both** outcomes (success *and*
exception) — otherwise a silent send-failure is indistinguishable from "no
events".

Run this **under the Monitor tool** (every printed line → one notification):

```sh
ssh <HOST> "tail -F -n0 <BACKEND_LOG>" \
  | grep --line-buffered -E "<SUCCESS_SIGNATURE>|<FAILURE_SIGNATURE>"
```

Mechanics that matter — get these exactly right:

- **`Monitor` tool, not `Bash`.** Bash captures output once; Monitor streams
  each line as it arrives and notifies per line while the agent continues.
- **`tail -F -n0`**: `-F` survives log rotation; `-n0` emits only *new* lines
  (no history replay flooding you on start).
- **`grep --line-buffered`**: without it, pipe buffering delays events by
  *minutes*. This flag is not optional.
- **Filter must include `<FAILURE_SIGNATURE>`**, not just success — a broken
  send must page you, not look like silence.

### Serverless / Vercel adaptation

If the backend is on Vercel/Lambda there is **no tailable `/var/log` file**.
Options, best first:

1. **Log drain** → ship logs to a host with a file, then Case A unchanged.
2. `vercel logs <deployment-url> --follow` under Monitor, grep the same way
   (works, but tied to a deployment and noisier).
3. Tiny internal echo: backend also `POST`s a one-line ping to a logging
   endpoint on a box you *can* tail. Overkill unless 1–2 are impossible.

(In *this* repo the MP send is `lib/ga-mp.ts`, logging
`GA-MP: qualified_enquiry sent` / `GA-MP: send failed` — Vercel-hosted, so
use option 1 or 2 here.)

---

## 3. Case B — browser / any event: Realtime poll + Monitor

Browser `gtag` events never hit your backend → nothing to tail. GA4 has no
event webhook. Only option: poll `runRealtimeReport` and print a line when a
watched event's count rises. Wrap **under Monitor**:

```python
# Monitor command: prints one line whenever a watched event's count increases.
python3 - <<'PY'
import json, time
from google.oauth2.credentials import Credentials
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import Dimension, Metric, RunRealtimeReportRequest

d = json.load(open('<OAUTH_JSON>'))
creds = Credentials(token=None, refresh_token=d['refresh_token'],
                    client_id=d['client_id'], client_secret=d['client_secret'],
                    token_uri=d['token_uri'], scopes=d['scopes'])
cl = BetaAnalyticsDataClient(credentials=creds)
WATCH = {<WATCH_EVENTS as a set of quoted strings>}
seen = {}
while True:
    try:
        r = cl.run_realtime_report(RunRealtimeReportRequest(
            property="properties/<PROPERTY_ID>",
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="eventCount")]))
        for row in r.rows:
            name = row.dimension_values[0].value
            cnt  = int(row.metric_values[0].value)
            if name in WATCH and cnt > seen.get(name, 0):
                print(f"GA4 fired: {name} (+{cnt - seen.get(name,0)})", flush=True)
            seen[name] = cnt
    except Exception as e:
        print(f"poll error: {e}", flush=True)
    time.sleep(30)
PY
```

- **Use Realtime** (`run_realtime_report`): lag is seconds–~1 min.
- **Never** use the standard `run_report` for "did it just fire" — it lags
  15 min to hours.
- `flush=True` is mandatory or Monitor sees nothing until buffer flush.

---

## 4. The reusable hard part — GA4 Data API auth

This is the ~2-hour detour. Hand these load-bearing facts to the agent so it
is **not** repeated:

- **Do NOT use a service account.** GA4 Property Access Management rejects SA
  emails ("doesn't match a Google Account"), even with billing linked.
- **Do NOT use `gcloud auth application-default login`** for the Analytics
  scope — Google blocks the sensitive scope on personal Gmail
  ("This app is blocked").
- **DO reuse an existing OAuth *desktop/installed* client** the account
  already consented to (e.g. an Ads/admin client). Mint a refresh token for
  `https://www.googleapis.com/auth/analytics.readonly`. Store as an
  `authorized_user` JSON.
- **Print the auth URL; do not auto-open the browser.** Auto-open lands in
  whatever Google session is default on the host — usually the wrong one.
- **Enable `analyticsdata.googleapis.com`** (and
  `analyticsadmin.googleapis.com` if you must discover the property ID) in
  **the OAuth client's GCP project** — that project, not wherever GA4 lives.
- **Stream ID ≠ Property ID.** Measurement Protocol (write) uses the *stream*
  ID; Data/Admin API (read) uses the *property* ID — different numbers. Wrong
  one → `PERMISSION_DENIED`. Discover the real property ID via the Admin API
  `list_account_summaries()`.
- Refresh tokens for such a client can be **revoked by Google as a
  side-effect of account security events** → just re-mint.

### Dependencies

```sh
pip install google-analytics-data google-analytics-admin \
            google-auth-oauthlib google-auth
```

### 4a. Token-mint script (the full thing)

```python
# mint_ga4_token.py — mint an analytics.readonly refresh token by REUSING an
# existing, already-consented installed/desktop OAuth client.
import json
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES         = ["https://www.googleapis.com/auth/analytics.readonly"]
CLIENT_SECRETS = "<CLIENT_SECRETS>"   # existing installed/desktop client json
OUT            = "<OAUTH_JSON>"        # authorized_user creds written here
PORT           = 8765

cs   = json.load(open(CLIENT_SECRETS))
node = cs.get("installed") or cs.get("web")   # robust to either shape
client_id, client_secret = node["client_id"], node["client_secret"]

flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, scopes=SCOPES)

# open_browser=False → prints the URL instead of opening the host's default
# Google session (which is the wrong account). Open the printed URL in the
# browser signed into the GA4-owning account.
#
# If the agent host is remote/headless, SSH-forward the callback port first:
#     ssh -L 8765:localhost:8765 <HOST>
# then open the URL on your laptop; the localhost redirect resolves through
# the tunnel. (run_console() is removed in current google-auth-oauthlib —
# this local-server-no-browser form is the supported replacement.)
creds = flow.run_local_server(
    host="localhost", port=PORT, open_browser=False,
    authorization_prompt_message=
        "Open this URL in the browser signed into the GA4-owning account:\n{url}",
)

json.dump({
    "type": "authorized_user",
    "client_id": client_id,
    "client_secret": client_secret,
    "refresh_token": creds.refresh_token,
    "token_uri": "https://oauth2.googleapis.com/token",
    "scopes": SCOPES,
}, open(OUT, "w"), indent=2)
print(f"Wrote {OUT}")
```

### 4b. Discover the real Property ID

```python
# find_ga4_property.py — Stream ID ≠ Property ID. This prints property IDs.
import json
from google.oauth2.credentials import Credentials
from google.analytics.admin import AnalyticsAdminServiceClient

d = json.load(open("<OAUTH_JSON>"))
creds = Credentials(token=None, refresh_token=d["refresh_token"],
                    client_id=d["client_id"], client_secret=d["client_secret"],
                    token_uri=d["token_uri"], scopes=d["scopes"])
client = AnalyticsAdminServiceClient(credentials=creds)
for acct in client.list_account_summaries():
    for p in acct.property_summaries:
        # p.property == "properties/123456789"  → <PROPERTY_ID> is 123456789
        print(p.property, "—", p.display_name)
```

Requires `analyticsadmin.googleapis.com` enabled in the OAuth client's GCP
project. `analytics.readonly` scope is sufficient (read-only summaries).

---

## 5. Quick-start checklist for the receiving agent

1. Determine the case: does the backend send GA4 itself (**A**) or only the
   browser (**B**)? Mixed → run both, A for conversions, B for page/UX events.
2. **Case A:** confirm the backend logs success *and* failure; fill
   `<HOST>/<BACKEND_LOG>/<*_SIGNATURE>`; run the `ssh … | grep` line under
   **Monitor**.
3. **Case B:** run `mint_ga4_token.py` (§4a) → `find_ga4_property.py` (§4b)
   to get `<PROPERTY_ID>` → run the Realtime poller (§3) under **Monitor**.
4. Always include the **failure** signature/handling — silence must be
   distinguishable from breakage.
5. Treat `<OAUTH_JSON>` and any client secret as secrets: never commit, keep
   out of `NEXT_PUBLIC_`/client bundles, store in gitignored env/secret paths.
