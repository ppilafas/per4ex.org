/**
 * Shared "brain" for the Supercore assistant.
 *
 * This module is transport-agnostic: it owns the knowledge base + system
 * instructions assembly, the LLM client, the tool definitions and the tool
 * executor. The text chat route (`app/api/chat/route.ts`) consumes these
 * pieces today; the voice Custom-LLM shim will consume the same pieces so
 * that text and voice share one brain (knowledge, persona, lead capture).
 *
 * Phase 0: pure helpers extracted here with identical logic. The streaming
 * / tool-loop orchestration still lives in the chat route and is unified in
 * a later phase.
 */

import OpenAI from "openai"
import { KNOWLEDGE_BASE_CONTEXT } from "@/lib/knowledge-base"
import { sendQualifiedEnquiry } from "@/lib/ga-mp"

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface SolutionContext {
  solutionId: string
  solutionTitle: string
  problem: string
  stack?: string[]
}

export interface PageContext {
  path: string
  title: string
  description: string
}

// ---------------------------------------------------------------------------
// OpenAI-compatible client pointed at HuggingFace Router
// ---------------------------------------------------------------------------

export function getBrainClient(): OpenAI {
  const token = process.env.HF_TOKEN
  if (!token) throw new Error("HF_TOKEN is not set")
  return new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: token,
  })
}

// ---------------------------------------------------------------------------
// Tool definitions (OpenAI function-calling format)
// ---------------------------------------------------------------------------

export const BRAIN_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "send_widget_contact_email",
      description:
        "Send a qualified lead/contact email to Panagiotis. Call this as soon as you have at minimum the visitor's email. Do not ask permission to send — but you MUST read the email address back to the visitor once to confirm spelling before calling (this is essential on voice calls). Fill every field you reasonably can from the conversation.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "Visitor's name. Ask for it if not given; only use 'Guest' if they decline.",
          },
          email: {
            type: "string",
            description:
              "Visitor email in CANONICAL form only: local@domain.tld, all lowercase, NO spaces, NO hyphens between letters, NO spelled-out words. If the visitor spelled or dictated it (e.g. 'p p i l a f a s at gmail dot com' or 'p-p-i-l-a-f-a-s@gmail.com'), reconstruct the real address ('ppilafas@gmail.com') before sending. REQUIRED.",
          },
          project: {
            type: "string",
            description:
              "What the visitor wants built or help with, in one or two sentences (use 'Not specified' if unclear)",
          },
          budget: {
            type: "string",
            description: "Rough budget if mentioned (use 'Not discussed' if not)",
          },
          timeline: {
            type: "string",
            description: "Desired timeline if mentioned (use 'Not discussed' if not)",
          },
          notes: {
            type: "string",
            description:
              "Any other useful context, constraints, or the visitor's own words (optional)",
          },
        },
        required: ["email"],
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Tool executor
// ---------------------------------------------------------------------------

export async function executeBrainToolCall(
  name: string,
  args: Record<string, string>,
  requestId: string,
  source = "Website",
  /** GA4 client_id from the browser `_ga` cookie, for session stitching.
   *  Undefined for server-to-server callers (e.g. the voice shim). */
  gaClientId?: string
): Promise<string> {
  if (name !== "send_widget_contact_email") {
    return `Unknown tool: ${name}`
  }

  const {
    name: visitorName = "Guest",
    email: rawEmail,
    project = "Not specified",
    budget = "Not discussed",
    timeline = "Not discussed",
    notes = "",
    // `message` kept for backward compatibility with any older callers
    message = "",
  } = args
  // Safe backstop only: strip stray whitespace the model may leave from a
  // dictated address. We deliberately do NOT strip hyphens — they are valid
  // in real addresses; canonicalisation is the model's job (see prompt).
  const email = typeof rawEmail === "string" ? rawEmail.replace(/\s+/g, "").toLowerCase() : rawEmail
  console.log(
    `[${requestId}] TOOL: send_widget_contact_email source=${source} email=${email} name=${visitorName}`
  )

  const resendKey = process.env.RESEND_API_KEY
  const ownerEmail = process.env.OWNER_EMAIL || "ppilafas@gmail.com"
  if (!resendKey) {
    console.log(`[${requestId}] TOOL: Email service not configured`)
    return "Email service not configured."
  }

  // Backstop: refuse a clearly malformed address rather than silently
  // emailing junk. We only reject structurally-broken input (no @, no
  // dotted domain, sub-2-char TLD). We do NOT second-guess plausible
  // addresses like "x@gmail.cm" — ".cm" is a real TLD; catching likely
  // typos is the model's job at read-back time (see LEAD CAPTURE PROTOCOL).
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    console.log(`[${requestId}] TOOL: rejected malformed email="${email}"`)
    return `The email address "${email}" doesn't look valid — it was not sent. Ask the visitor to repeat it slowly, read it back to confirm, then try again.`
  }

  const body = [
    `Name: ${visitorName}`,
    `Email: ${email}`,
    `Project: ${project}`,
    `Budget: ${budget}`,
    `Timeline: ${timeline}`,
    `Notes: ${notes || message || "—"}`,
    `Source: ${source} (supercore.tech)`,
  ].join("\n")

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Supercore Leads <onboarding@resend.dev>",
      to: [ownerEmail],
      reply_to: email,
      subject: `[Lead · ${source}] ${visitorName}`,
      text: body,
    }),
  })

  if (!res.ok) {
    console.error(`[${requestId}] Email error:`, res.status, await res.text())
    return "Failed to send email. Please try again."
  }
  console.log(`[${requestId}] Email sent to ${ownerEmail} from ${email}`)

  // Confirmed qualified lead → fire the server-side GA4 conversion.
  // Bounded + never throws; no PII leaves here (only source).
  await sendQualifiedEnquiry({ source, clientId: gaClientId, requestId })

  return "Email sent successfully."
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSystemPrompt(
  systemInstructions: string,
  solution_context: SolutionContext | undefined,
  page_context: PageContext | undefined
): string {
  let contextPrompt = ""

  if (page_context) {
    contextPrompt += `
=== CURRENT PAGE CONTEXT ===
The user is currently viewing: ${page_context.title}
URL Path: ${page_context.path}
Page Description: ${page_context.description}

IMPORTANT: Tailor your responses to this specific page content. Reference information relevant to ${page_context.title}.
If the user asks questions, assume they're about ${page_context.title} unless otherwise specified.
============================
`
  }

  if (solution_context) {
    contextPrompt += `
=== PROJECT INTAKE PROTOCOL ===
You are conducting a project intake for: "${solution_context.solutionTitle}"

THE USER IS INTERESTED IN THIS SOLUTION:
- Solution: ${solution_context.solutionTitle}
- Problem it solves: ${solution_context.problem}
- Tech stack: ${solution_context.stack?.join(", ") || "To be determined"}

YOUR TASK: Collect project requirements through a friendly, professional conversation.

REQUIRED INFORMATION (collect in this order, ONE question at a time):
1. TIMEFRAME: "When do you need this live?" (Examples: 2 weeks, 1 month, 3 months, flexible)
2. BUDGET: "What's your budget range for this project?" (Examples: $5K-10K, $10K-25K, $25K+, not sure yet)
3. EMAIL: "What's the best email to reach you at?"
4. DETAILS (optional): "Any specific requirements or constraints I should know about?"

CONVERSATION RULES:
- Start by acknowledging their interest in "${solution_context.solutionTitle}" enthusiastically
- Ask ONE question at a time - never multiple questions in one message
- Acknowledge each answer briefly before asking the next question
- If user goes off-topic, respond briefly then redirect: "That's a great point! I'll note that. Now, [next question]..."
- If user wants to skip a question, use defaults: Timeframe="Flexible", Budget="To be discussed"
- Be warm and professional, not robotic

EMAIL IS REQUIRED - politely persist until you have it.

COMPLETION:
Once you have at minimum the EMAIL, read the email address back to confirm spelling, then call the 'send_widget_contact_email' tool with these structured fields:
- name: User's name if mentioned, otherwise "Prospective Client"
- email: The confirmed email they provided
- project: "${solution_context.solutionTitle}" plus any specifics they described
- budget: collected, or "To be discussed"
- timeline: collected, or "Flexible"
- notes: any additional requirements/constraints, plus "Solutions Page - ${solution_context.solutionId}"

AFTER SENDING EMAIL:
- Confirm: "Perfect! I've sent your project details to Panagiotis. He typically responds within 24 hours."
- The intake is COMPLETE - do NOT re-ask timeframe, budget, or email questions
- If the user asks follow-up questions about the solution or project, answer helpfully
===============================
`
  } else {
    contextPrompt += `
=== LEAD CAPTURE PROTOCOL ===
When the visitor wants to hire Panagiotis, discuss a project, or be contacted, capture a qualified lead. Keep it conversational — do not interrogate.
0. FIRST take stock of what the visitor has ALREADY told you earlier in this conversation. NEVER ask again for a name, email, or detail they have already given — acknowledge it ("Thanks, <name>") and ask only for what is genuinely still missing. If they ask how to reach Panagiotis, answer that directly first (email: contact@supercore.tech) before offering to take their details.
1. NATURALLY gather, across the conversation (not as a rigid form):
   - their name — always ask for it ("And who should I say this is from?"); only fall back to "Guest" if they decline
   - what they want built or need help with (project)
   - rough budget, if they'll share it
   - timeline, if they'll share it
2. EMAIL is required. Ask for it, then READ IT BACK to confirm — on a voice call, say it letter by letter (e.g. "so that's j-o-h-n at gmail dot com — did I get that right?"). SANITY-CHECK it before accepting: if the domain or TLD looks like a likely mistake — e.g. ".cm"/".con"/".co" where ".com" is meant, or "gmial"/"gmai"/"hotmial"/"yaho" — do NOT just accept it; ask "I think you meant <corrected> — is that right?" and only use the corrected address once they confirm. After they confirm, RECONSTRUCT the canonical address in your head: lowercase, no spaces, no hyphens between letters, no spelled-out "at"/"dot". You must pass the real address (e.g. "john@gmail.com") to the tool — never the spelled-out form like "j-o-h-n@gmail.com".
3. ACTION: Once the email is confirmed, call 'send_widget_contact_email' with the structured fields (name, email, project, budget, timeline, notes) — email in canonical form. Use the defaults for anything not discussed — never block on budget/timeline.
4. RESPONSE: After sending, confirm: "Perfect — I've passed your details to Panagiotis. He typically responds within 24 hours." Do not re-ask for details already captured.
=============================
`
  }

  return `${systemInstructions}\n\n${contextPrompt}\n\n${KNOWLEDGE_BASE_CONTEXT}`
}
