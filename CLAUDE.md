# CLAUDE.md

Project conventions for AI agents working in this repo. These instructions are authoritative — follow them exactly.

## Project context

This is **supercore.tech** — Panagiotis's personal portfolio / showcase site (Next.js, deployed on Vercel). It runs **no mission-critical services**. A bad production deploy has near-zero blast radius and is trivially reversible. Agent autonomy here is deliberately loose; favor speed of iteration over caution.

## Scope note — not all work here is codebase work

Some conversations in this repo are **proposal / client-acquisition work**, not site code. That work lives in `local/proposals/` (gitignored) plus auto-memory, and does not touch the Next.js codebase. If the task is about Upwork proposals, client interactions, or the opportunity pipeline, read `local/proposals/_WORKFLOW.md` first and operate by that system. Similarly, for **inbound-lead handling** (Gmail discovery of assistant/contact-form leads, triage, first reply), follow `docs/LEADS_WORKFLOW.md` — Gmail labels are the shared state across sessions; drafts only, never auto-send. The commit/deploy protocol below applies only to actual code changes.

## Commit protocol — autonomous, no asking

**Bias hard toward action. Do not be trigger-shy.** This is a fast-iteration solo project worked in short spare-time bursts; the failure mode here is hesitating, not over-committing. Never ask "should I commit?", never hedge, never wait for permission or pile on confirmations. When a unit of work is complete and working, commit it immediately and move on. The scoping check below is a mechanical ~5-second safeguard, **not** a reason to slow down or ask.

- Commit your completed work **without asking for confirmation**.
- Commit **directly to `main`**. Do **not** create feature branches. (Intentionally overrides the usual "branch off the default branch first" default — speed is the priority here.)
- **Scope every commit to only the files this session actually created or modified.** Multiple conversations run in parallel against this same working tree. Run `git status` to *see* what else is in flight, then **leave those files alone** — they belong to other sessions.
  - `git add <explicit/paths/you/changed>` — list them out explicitly.
  - **Never** `git add -A`, `git add .`, or `git commit -am`. These sweep other sessions' uncommitted work into the wrong commit.
  - Same for untracked files/dirs: don't commit ones you didn't create.
- **Staging-verification (the critical gotcha — quick, do it and keep moving):** `git add <path>` does **not** unstage what another session already staged. A path-scoped *add* is not a path-scoped *commit* — pre-staged foreign changes ride along silently. So immediately before committing:
  1. `git diff --cached --name-status` — confirm **only your paths** are staged.
  2. If a foreign path is staged: `git reset HEAD -- <foreign path>` to unstage it, do your commit, then `git add <foreign path>` to restore the other session's staged state.
  3. Sanity-check the commit output ("N files changed") matches what you expect.
- End commit messages with the standard trailer:
  `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`

### This file (CLAUDE.md) is shared coordination state

CLAUDE.md is authored and revised across sessions. **Whoever edits it last commits it** — if you modify CLAUDE.md, include it in your scoped commit yourself. This deliberately overrides the "don't commit files you didn't create" rule *for this one file*, so the latest protocol is never left sitting uncommitted waiting on its original author.

## Deploy protocol — on the user's command, but remind proactively

"Deploy" = `git push origin main`. Vercel auto-builds from the push; there is no separate deploy step.

- **Production deploy is *always* `git push origin main` — one standardized path.** The Vercel CLI is installed and this repo is linked (`.vercel/`), so `vercel --prod` / `vercel deploy --prod` *works* — **do not use it.** The CLI snapshots the current working tree, which on this shared multi-session tree means deploying other sessions' uncommitted in-flight work and producing a prod build that matches no git SHA (un-auditable, not `git revert`-able). Git-push deploys keep prod 1:1 with a commit on `main`. The CLI is acceptable **only** for throwaway *preview* builds (`vercel` with no `--prod`), never for production.
- **Never push autonomously.** Pushing is the user's call so he can pace iteration across conversations.
- After committing, surface a brief one-line nudge, e.g.:
  `Committed <summary>. Ready to deploy — say the word and I'll push to main.`
- Then push **only on the user's explicit instruction**.
- Keep the nudge non-blocking. If the user doesn't respond to it, drop it — he may deploy from another conversation or batch deploys later. Don't re-prompt repeatedly.
