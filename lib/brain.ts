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
            description: "Visitor's name (use 'Guest' if not provided)",
          },
          email: {
            type: "string",
            description: "Visitor email address - REQUIRED. Confirm spelling before sending.",
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
  source = "Website"
): Promise<string> {
  if (name !== "send_widget_contact_email") {
    return `Unknown tool: ${name}`
  }

  const {
    name: visitorName = "Guest",
    email,
    project = "Not specified",
    budget = "Not discussed",
    timeline = "Not discussed",
    notes = "",
    // `message` kept for backward compatibility with any older callers
    message = "",
  } = args
  console.log(
    `[${requestId}] TOOL: send_widget_contact_email source=${source} email=${email} name=${visitorName}`
  )

  const resendKey = process.env.RESEND_API_KEY
  const ownerEmail = process.env.OWNER_EMAIL || "ppilafas@gmail.com"
  if (!resendKey) {
    console.log(`[${requestId}] TOOL: Email service not configured`)
    return "Email service not configured."
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
1. NATURALLY gather, across the conversation (not as a rigid form):
   - what they want built or need help with (project)
   - rough budget, if they'll share it
   - timeline, if they'll share it
   - their name
2. EMAIL is required. Ask for it, then READ IT BACK to confirm spelling before sending — especially on a voice call, where you must spell it out (e.g. "j-o-h-n at gmail dot com — did I get that right?"). Do not skip this confirmation.
3. ACTION: Once the email is confirmed, call 'send_widget_contact_email' with the structured fields (name, email, project, budget, timeline, notes). Use the defaults for anything not discussed — never block on budget/timeline.
4. RESPONSE: After sending, confirm: "Perfect — I've passed your details to Panagiotis. He typically responds within 24 hours." Do not re-ask for details already captured.
=============================
`
  }

  return `${systemInstructions}\n\n${contextPrompt}\n\n${KNOWLEDGE_BASE_CONTEXT}`
}
