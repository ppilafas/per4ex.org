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

**Voice:** direct, senior, honest about fit. No filler, no "I'd love to
hear more about your exciting project." Match the project's positioning:
senior AI systems engineer, Athens, ships private/AI systems for teams
with real constraints. (Same probe-style discipline as the Upwork
proposal memory: short, audition the client, no name-dropping in round 1.)

### HOT / WARM
```
Hi <first name>,

Thanks for reaching out via supercore.tech — saw your note about
<one-line restatement of their actual ask>.

To know whether I'm the right fit and what this would look like in
practice, two quick questions:

1. <Targeted question about the WHY — for private-AI leads:
   what's driving the self-host requirement specifically?
   compliance/data residency, cost at scale, or latency/control?>
2. <Context question about their constraints — current infra,
   rough volume or workload, budget range if known.>

Happy to give you a straight answer on whether self-hosting fits
your case and what it would take. A short call works too — send a
window or two and I'll pick one.

— Panagiotis
contact@supercore.tech
```

### COLD
```
Hi <first name>,

Thanks for the note. To give you a useful answer I need a bit more —
specifically <name the missing thing: the actual problem, budget range,
what success looks like>.

— Panagiotis
```

**Always draft, never auto-send.** Use `create_gmail_draft` then surface
the draft + classification reasoning to the human. `send_gmail` only after
explicit per-message approval.

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
