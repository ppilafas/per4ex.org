# GA4 Data API — agent automation

Lets an agent **read** GA4 and get **notified the moment an event fires**
(`qualified_enquiry`, `assistant_open`, `email_click`) via the Monitor tool.

Credentials live in the gitignored `local/ga4/` dir — nothing secret is ever
committed. Scripts resolve paths automatically; run them from the repo root.

---

## 1. One-time human steps (Google Cloud — irreducible)

GA4 Data API has no service-account or `gcloud` shortcut (see
`docs/GA4_NOTIFY_HANDOFF.md` §4 for why). Do this once:

1. **Google Cloud Console** → pick a project (reuse the one behind your Gemini
   API key, or create a new one). Note the project.
2. **APIs & Services → Enabled APIs → + Enable APIs**, enable **both**:
   - `Google Analytics Data API` (`analyticsdata.googleapis.com`)
   - `Google Analytics Admin API` (`analyticsadmin.googleapis.com`)
3. **APIs & Services → OAuth consent screen**: User type **External** →
   add your Gmail (the GA4-owning account) under **Test users** → add scope
   `.../auth/analytics.readonly`. (Test mode is fine; no verification needed
   for your own use.)
4. **APIs & Services → Credentials → + Create credentials → OAuth client ID
   → Application type: Desktop app**. Create, **Download JSON**.
5. Save that file as: `local/ga4/client_secret.json`

## 2. One-time setup (automated — already prepared)

A venv with deps is created at `local/ga4/.venv` (gitignored). If it's
missing, recreate:

```sh
python3 -m venv local/ga4/.venv
local/ga4/.venv/bin/pip install -r scripts/ga4/requirements.txt
```

## 3. Mint the token (human — browser consent, ~1 min)

```sh
local/ga4/.venv/bin/python scripts/ga4/mint_token.py
```

It prints a URL. Open it **in the browser signed into the GA4-owning Google
account**, approve. Writes `local/ga4/ga4-oauth.json` (the refresh token).

## 4. Find the Property ID (Stream ID ≠ Property ID)

```sh
local/ga4/.venv/bin/python scripts/ga4/find_property.py
```

Copy the numeric ID for **"Supercore Web"**. Export it (or pass as argv):

```sh
export GA4_PROPERTY_ID=<numeric id>
```

## 5. Notify-on-fire (run UNDER the Monitor tool)

```sh
GA4_PROPERTY_ID=<id> local/ga4/.venv/bin/python scripts/ga4/watch_realtime.py
```

Run this with the **Monitor** tool, not Bash: every printed line becomes a
live notification. Realtime lag is seconds–~1 min. The watcher prints
`GA4 fired: <event> (+n)` per increase and never dies silently
(`poll error:` lines surface API issues instead of going quiet).

---

## Notes

- `qualified_enquiry` is also pushed **server-side** (`lib/ga-mp.ts`); the
  fastest signal for *that one* is tailing the backend log — but on Vercel
  there's no tailable file, so this Realtime watcher is the practical path.
- Re-run `mint_token.py` if Google revokes the refresh token after an
  account security event.
- Full rationale + portable version for other projects:
  `docs/GA4_NOTIFY_HANDOFF.md`.
