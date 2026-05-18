# Google Ads API — campaign data + kill/scale automation

Pulls cost / impressions / clicks / conversions (incl. **per-country**, the
input for the geo decision) and runs a Monitor watcher that fires only when
the smoke test's pre-registered kill or scale rule is crossed.

Reuses the **same OAuth desktop client** as GA4 (`local/ga4/client_secret.json`)
— only the scope differs. Secrets live in gitignored `local/ads/`.

---

## 1. One-time human step — developer token (the real gate)

The Ads API needs a **developer token**, and a fresh one only works against
test accounts until upgraded to **Basic access** (a short application).

1. In **Google Ads** (signed in as the account owner): **Tools → API Center**
   (under "Setup"). Note: API Center appears on **Manager (MCC)** accounts; if
   you don't see it, create a free Manager account and link this account to it.
2. Accept terms → copy the **Developer token**.
3. Apply for **Basic access** (form in API Center). Approval is usually fast
   (often same day) but not instant — this is the bottleneck.
4. Get the **Customer ID**: the 10-digit number top-right in Google Ads
   (format `123-456-7890`). If you went via a Manager account, also note the
   **manager (login) customer ID**.

Put these in `local/ads/ads.env` (gitignored):

```
ADS_DEVELOPER_TOKEN=xxxxxxxxxxxxxxxxxxxxxx
ADS_CUSTOMER_ID=1234567890
# ADS_LOGIN_CUSTOMER_ID=1234567890   # only if accessed via a manager account
```

## 2. Venv

Reuse the GA4 venv (it already has google-auth-oauthlib); add the Ads lib:

```sh
local/ga4/.venv/bin/pip install -r scripts/ads/requirements.txt
```

## 3. Mint the adwords-scoped token (browser consent, ~1 min)

```sh
cd scripts/ads && ../../local/ga4/.venv/bin/python -u mint_token.py
```

Open the printed URL in the browser signed into the **Google Ads** account,
approve. Writes `local/ads/ads-oauth.json`.

## 4. Pull the report (the geo-decision data)

```sh
cd scripts/ads && ../../local/ga4/.venv/bin/python pull_report.py 7
```

Country rows are sorted by **impressions** (demand signal — read this, not
CPC-distorted click counts).

## 5. Kill/scale watcher (run UNDER the Monitor tool)

```sh
cd scripts/ads && ../../local/ga4/.venv/bin/python -u watch_kill.py
```

Emits a `Ads status:` heartbeat plus a one-shot `KILL TRIGGERED` /
`SCALE SIGNAL` line per the pre-registered rule
(`ADS_KILL_SPEND_EUR`=50, `ADS_SCALE_CONVERSIONS`=1 by default). Ads metrics
lag ~hours, so it polls every 30 min — pair it with the GA4 realtime watcher
for fast conversion signal.
