# Inbound Leads — Shared Agent Workflow

A playbook for any Claude agent in this repo to handle inbound leads to
`ppilafas@gmail.com`: discover, classify, draft a first reply, track state.

**The authoritative source of truth for state is Gmail labels.** Anything an
agent does to a lead MUST update labels — otherwise the next session
re-processes it. This is what keeps multiple parallel agents from doubling
work or double-replying.

---

## 1. Lead channels (two)

### A) Assistant captures (chat widget + voice agent)
Sent server-side by `lib/brain.ts` via Resend after the assistant collects
an enquiry. Always lands in `ppilafas@gmail.com`.

- **From:** `Supercore Leads <onboarding@resend.dev>` (`Supercore Leads` is
  the *display name*; the address is `onboarding@resend.dev`).
- **Subject:** `[Lead · Chat widget] <name>` or `[Lead · Voice agent] <name>`
- **Gmail query:** `from:onboarding@resend.dev subject:Lead`

### B) Direct email to `contact@supercore.tech`
Migadu mailbox; forwarded to `ppilafas@gmail.com`.

- **Gmail query:** `to:contact@supercore.tech` (Gmail preserves the original
  To on forwards)
- Helpful narrow: `subject:"Private AI inference enquiry"` (the
  `/private-ai` page's mailto template subject)

### Combined daily sweep
```
(from:onboarding@resend.dev OR to:contact@supercore.tech) newer_than:2d \
  -label:Leads/Triaged -label:Leads/Replied -label:Leads/Skipped -label:Leads/Test
```

---

## 2. State — Gmail labels (authoritative)

Create on first use (idempotent — ignore "already exists" errors):

| Label | Meaning |
|---|---|
| `Leads/New` | Discovered, not yet classified (optional — absence of any `Leads/*` label means New) |
| `Leads/Triaged` | Classified, draft prepared if applicable |
| `Leads/Replied` | First reply sent |
| `Leads/Skipped` | Deliberately not replying (e.g. tire-kicker) |
| `Leads/Test` | Known internal test fire (e.g. pikos@gmail.com) |

If a thread has *no* `Leads/*` label, treat as `New`.

---

## 3. Triage rules

Apply in order; first match wins.

**SKIP → label `Leads/Test` or `Leads/Skipped`:**
- Email matches a known test (`pikos@gmail.com`, captures showing
  `ppilafas@gmail.com` as the visitor — that's the owner)
- Names matching prior test fires (`pikos`, `takis`, `Guest` with no
  follow-up content)

**HOT → substantive reply with qualifying questions:**
- Corporate email domain (not gmail/hotmail/yahoo/outlook etc.)
- Specific project description (not "Not specified")
- Mentions budget, timeline, OR asks for cost/scope
- (Once geo narrows) — sender from target geo

**WARM → brief reply, one qualifying question:**
- Personal email but specific project description
- Real problem statement, no budget signal

**COLD → one-line polite probe or skip:**
- `Budget: Free` explicit
- Multiple repeated low-content captures from one session (assistant
  capturing every confused turn)
- Generic / "Not specified" project

---

## 4. Anti-double-reply check (mandatory, before drafting)

Before creating a draft OR sending, the agent MUST verify:

1. The thread carries no `Leads/Replied` label.
2. `search_gmail` for the thread (use `threadId` from the lead message)
   shows no message `from:ppilafas@gmail.com`.

If either is true → stop, ensure the correct label is applied, do nothing
else. This protects against parallel agents replying twice to the same
prospect.

---

## 5. Reply template (first contact)

**Voice rules** — what survived calibration with real sends (Raju, Kamol,
20 May 2026):

- **Narrative, not bulleted.** Questions live inside a sentence joined with
  "and," not numbered lists.
- **One opinion or observation, not pure agreement** ("Sensible direction,"
  not "Great question!"). Not sycophantic.
- **Em-dashes: aim for zero, at most one.** They are the strongest AI-slop
  tell after bullet lists.
- **Slight rhythm variation.** Don't write equally-weighted polished
  sentences in a row.
- **Never:** "Thanks for reaching out," "I'd love to," "happy to," "looking
  forward to," "hope this finds you well."
- **Sign-off identifies, doesn't decorate:** `Panagiotis Pilafas` then
  `supercore.tech` on the next line. No calendar links, no email line
  (already in the From).
- **Naming Catalyst (the assistant)** is acceptable in inbound replies —
  the visitor already touched it. Don't name other personal projects
  (Forensic AI Studio, GTO Poker Coach, etc.) in round 1.

### HOT / WARM (reconnaissance — assistant-captured lead)
```
Hi <first name>,

You contacted the assistant on supercore.tech a few times asking about
<one-line restatement of their actual ask>. Sensible direction,
especially if <one-liner pointing at why their stated need has real
teeth>.

Before I write back with anything useful, <one or two qualifying
questions joined inside a sentence — distinguishing layers, not
yes/no. For private-AI leads: "is this for your own setup, for a
company, or for a client? And when you say 'private,' is that a hard
requirement (compliance, data residency, contract clause) or a
preference?">

If this is exploratory and you're mainly trying to see how the
pieces fit, point me there and I can send you some reading material.
If you need an actual deployment built, those answers will tell me
whether I'm the right person and roughly what it would take.

Easier still: a ten-minute call usually settles those questions
faster than email.

Panagiotis Pilafas
supercore.tech
```

### COLD probe (empty body / "Free" budget / vague ask)
```
Hi <first name>,

Got <one-sentence factual observation about what they sent> through
<the channel they used>. Might have been an accidental click. If you
actually wanted to ask something about <topic>, send it over.

— Panagiotis
```

### Subject conventions

- **Direct mail from visitor** (mailto, `contact@supercore.tech`): reply
  with `Re: <their exact original subject>` (typos and all) — preserves
  threading on the visitor's side.
- **Assistant-captured lead** (no prior email from visitor): do NOT use
  the internal Resend subject `[Lead · Chat widget] <name>`. The visitor
  never saw that subject and it reads like spam from a stranger. Use
  `Following up from supercore.tech` or `Following up on your conversation
  with Catalyst`.

### First-name disambiguation

Trust the email handle, not what the visitor typed into the assistant. The
form field captures whatever they wrote (may be a middle name, nickname, or
compound name); the email address they registered with themselves is the
ground truth. Example: `raju.thapa9980@gmail.com` → first name is **Raju**,
even if the assistant captured "Laxman Raju."

### Threading caveat (technical)

`mcp__catalyst__create_gmail_draft` does NOT accept `threadId`. Drafts
therefore go out as standalone messages, not in-thread replies. Acceptable
because:
- Assistant-captured leads have no prior visitor-side thread anyway.
- Direct-mail replies thread on the visitor's side as long as the subject
  is `Re: <original subject>`.
- The original inbound thread in your inbox is tracked via Gmail labels,
  not by the reply being contained in it.

**Always draft, never auto-send.** Use `create_gmail_draft` then surface
the draft + classification reasoning to the human. `send_gmail` only after
explicit per-message approval.

### Reviewer checklist before send (~15 seconds)

1. **Subject** is human-friendly (not the internal Resend lead subject).
2. **From** dropdown is `contact@supercore.tech` (default in the Gmail
   composer is `ppilafas@gmail.com`; easy to forget; the per-message switch
   matters).
3. **Body** reads cleanly once with fresh eyes.

---

## 6. Tools (load schemas on demand via ToolSearch)

Tool names — load each via `ToolSearch select:<name>` before first call:

- `mcp__catalyst__search_gmail` — discovery (Gmail query syntax)
- `mcp__catalyst__read_gmail` — full body of a message
- `mcp__catalyst__create_gmail_draft` — draft the first reply (preferred)
- `mcp__catalyst__send_gmail` — **only after human approval per draft**
- `mcp__claude_ai_Gmail__create_label` — create the `Leads/*` labels
- `mcp__claude_ai_Gmail__label_thread` / `unlabel_thread` — state updates

---

## 7. Standard agent flow

1. Run the combined sweep query (§1) → list candidates.
2. For each candidate, in order:
   a. **Anti-double-reply check** (§4). If failed, label-only and move on.
   b. Classify per §3.
   c. `read_gmail` the full body if classification needs it.
   d. **If HOT/WARM/COLD:** `create_gmail_draft` per template (§5),
      `label_thread Leads/Triaged`.
   e. **If SKIP:** `label_thread Leads/Skipped` (or `Leads/Test`).
3. Surface to the human: a concise list `<name> · <email> · <classification>
   · <one-line why> · <draft id if any>`.
4. **Only on explicit human approval** of a specific draft:
   `send_gmail` (or send the draft) → `label_thread Leads/Replied` (and
   remove `Leads/Triaged`).

---

## Why the safeguards

- **Drafts not autosend.** Outbound emails to real prospects are
  unrecoverable. Drafts are reviewable, sends aren't.
- **Labels not memory.** Multi-session, multi-agent safety needs durable
  shared state; Gmail labels are the only store all agents can read.
- **Anti-double-reply.** Two parallel sessions both seeing a `New` lead
  without coordination → duplicate replies → bad signal to the prospect.
  The label + thread check is the lock.
