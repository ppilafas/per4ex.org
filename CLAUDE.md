# CLAUDE.md

Project conventions for AI agents working in this repo. These instructions are authoritative — follow them exactly.

## Project context

This is **supercore.tech** — Panagiotis's personal portfolio / showcase site (Next.js, deployed on Vercel). It runs **no mission-critical services**. A bad production deploy has near-zero blast radius and is trivially reversible. Agent autonomy here is deliberately loose; favor speed of iteration over caution.

## Scope note — not all work here is codebase work

Some conversations in this repo are **proposal / client-acquisition work**, not site code. That work lives in `local/proposals/` (gitignored) plus auto-memory, and does not touch the Next.js codebase. If the task is about Upwork proposals, client interactions, or the opportunity pipeline, read `local/proposals/_WORKFLOW.md` first and operate by that system. The commit/deploy protocol below applies only to actual code changes.

## Commit protocol — autonomous, no asking

Commit your completed work **without asking for confirmation**.

- Commit **directly to `main`**. Do **not** create feature branches. (This intentionally overrides the usual "branch off the default branch first" default — fast iteration is the priority here.)
- **Scope every commit to only the files this session actually created or modified.** Multiple conversations run in parallel against this same working tree. Before committing, run `git status` to *see* what else is in flight, then **leave those files alone** — they belong to other sessions.
  - `git add <explicit/paths/you/changed>` — list them out.
  - **Never** `git add -A`, `git add .`, or `git commit -am`. These sweep other sessions' uncommitted work into the wrong commit.
  - The same applies to untracked files/dirs: don't commit ones you didn't create.
- End commit messages with the standard trailer:
  `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`

## Deploy protocol — on the user's command, but remind proactively

"Deploy" = `git push origin main`. Vercel auto-builds from the push; there is no separate deploy step.

- **Never push autonomously.** Pushing is the user's call so he can pace iteration across conversations.
- After committing, surface a brief one-line nudge, e.g.:
  `Committed <summary>. Ready to deploy — say the word and I'll push to main.`
- Then push **only on the user's explicit instruction**.
- Keep the nudge non-blocking. If the user doesn't respond to it, drop it — he may deploy from another conversation or batch deploys later. Don't re-prompt repeatedly.
