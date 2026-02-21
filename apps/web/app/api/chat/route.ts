import { NextRequest, NextResponse } from "next/server"
import { streamText, tool, generateText } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { KNOWLEDGE_BASE_CONTEXT } from "@/lib/knowledge-base"
import { getSystemInstructions } from "@/lib/system-instructions"
import { appendChatLog } from "@/lib/chat-log"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface SolutionContext {
  solutionId: string
  solutionTitle: string
  problem: string
  stack?: string[]
}

interface PageContext {
  path: string
  title: string
  description: string
}

function buildSystemPrompt(
  systemInstructions: string,
  solution_context: SolutionContext | undefined,
  page_context: PageContext | undefined
): string {
  let contextPrompt = ""
  
  // Add page context if available
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

  // Add solution/project context if available
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
Once you have at minimum the EMAIL, immediately call the 'send_widget_contact_email' tool with:
- Name: User's name if mentioned, otherwise "Prospective Client"
- Email: The email they provided
- Message: A structured summary like:
  "PROJECT INQUIRY: ${solution_context.solutionTitle}
   Timeframe: [collected or 'Flexible']
   Budget: [collected or 'To be discussed']
   Details: [any additional details shared]
   Source: Solutions Page - ${solution_context.solutionId}"

AFTER SENDING EMAIL:
- Confirm: "Perfect! I've sent your project details to Panagiotis. He typically responds within 24 hours."
- The intake is COMPLETE - do NOT re-ask timeframe, budget, or email questions
- If the user asks follow-up questions about the solution or project, answer helpfully
===============================
`
  } else {
    // Standard contact protocol when not in solution context
    contextPrompt += `
=== CONTACT FORM PROTOCOL ===
If the user wants to contact support, send a message, or hire me:
1. REQUIREMENT: You MUST obtain the user's **Email Address**. If missing, ask for it.
2. DEFAULTS: If Name is missing, use 'Guest'. If Message is missing, use 'Inquiry from Chat Widget'.
3. ACTION: Once you have the Email, **IMMEDIATELY** call the 'send_widget_contact_email' tool.
4. RESPONSE: After sending the email, confirm to the user: "Perfect! I've sent your message to Panagiotis. He typically responds within 24 hours."
=============================
`
  }

  return `${systemInstructions}\n\n${contextPrompt}\n\n${KNOWLEDGE_BASE_CONTEXT}`
}

function createSSEStream(textStream: AsyncIterable<string>): ReadableStream {
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const textPart of textStream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: textPart })}\n\n`))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

export async function POST(req: NextRequest) {
  const requestId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const startTime = performance.now()

  console.log(`\n[${requestId}] Chat request started`)

  try {
    const body = await req.json()
    const { messages, solution_context, page_context } = body

    console.log(`[${requestId}] payload:`, {
      messageCount: messages?.length || 0,
      hasSolutionContext: !!solution_context,
      solutionTitle: solution_context?.solutionTitle || "none",
      hasPageContext: !!page_context,
      pageTitle: page_context?.title || "none",
    })

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 })
    }

    const systemInstructions = await getSystemInstructions()
    const systemPrompt = buildSystemPrompt(
      systemInstructions,
      solution_context as SolutionContext | undefined,
      page_context as PageContext | undefined
    )

    console.log(`[${requestId}] Using Gemini 2.0 Flash via Vercel AI SDK`)

    const lastUserMsg = (messages as ChatMessage[]).filter((m) => m.role === "user").pop()?.content || ""

    let messagesForLlm = (messages as ChatMessage[]).map((msg) => ({
      role: msg.role === "system" ? ("user" as const) : msg.role,
      content: msg.content,
    }))

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: messagesForLlm,
      tools: {
        send_widget_contact_email: tool({
          description: `Send a contact email to Panagiotis. TRIGGER: Call this immediately when user provides their email and wants to contact Panagiotis. Do not ask for confirmation, just send it.`,
          inputSchema: z.object({
            name: z.string().describe("Visitor name (use 'Guest' if not provided)"),
            email: z.string().describe("Visitor email address - REQUIRED"),
            message: z.string().describe("Message content (use 'Inquiry from Chat Widget' if not provided)"),
          }),
          execute: async ({ name, email, message }: { name: string; email: string; message: string }) => {
            console.log(`[${requestId}] TOOL: send_widget_contact_email called with email=${email}, name=${name}`)
            const resendKey = process.env.RESEND_API_KEY
            const ownerEmail = process.env.OWNER_EMAIL || "ppilafas@gmail.com"
            if (!resendKey) {
              console.log(`[${requestId}] TOOL: Email service not configured`)
              return "Email service not configured."
            }
            console.log(`[${requestId}] TOOL: Sending email via Resend...`)
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Supercore Chat <onboarding@resend.dev>",
                to: [ownerEmail],
                subject: `[Chat] Message from ${name}`,
                text: `From: ${name} <${email}>\n\n${message}\n\n---\nSent via Supercore chat widget`,
              }),
            })
            if (!res.ok) {
              console.error(`[${requestId}] Email error:`, res.status, await res.text())
              return "Failed to send email. Please try again."
            }
            console.log(`[${requestId}] Email sent to ${ownerEmail} from ${email}`)
            return "Email sent successfully."
          },
        }),
      },
    })

    let finalText = result.text
    let toolWasCalled = result.finishReason === "tool-calls" || (result.toolCalls && result.toolCalls.length > 0)

    if (toolWasCalled && result.toolResults) {
      console.log(`[${requestId}] TOOL: Follow-up call needed after tool execution`)

      // Build message history with tool call and results properly formatted
      const toolCallMsg = result.toolCalls?.map(tc => `${tc.toolName} called with: ${JSON.stringify(tc.input)}`).join("\n") || "Tool was called"
      const toolResultMsg = result.toolResults.map(tr => `${tr.toolName} result: ${tr.output}`).join("\n")

      const followUpMessages = [
        ...messagesForLlm,
        {
          role: "assistant" as const,
          content: `I called the following tool:\n${toolCallMsg}\n\nResults:\n${toolResultMsg}`,
        },
      ]

      console.log(`[${requestId}] TOOL: Making follow-up call with ${followUpMessages.length} messages`)

      const followUpResult = await generateText({
        model: google("gemini-2.0-flash"),
        system: systemPrompt,
        messages: followUpMessages,
      })

      finalText = followUpResult.text
      console.log(`[${requestId}] TOOL: Follow-up response received (${finalText.length} chars)`)
    }

    const durationMs = Math.round(performance.now() - startTime)
    console.log(`[${requestId}] Response ready in ${durationMs}ms, finishReason: ${result.finishReason}${toolWasCalled ? " (tool executed)" : ""}`)

    appendChatLog({
      userMessage: lastUserMsg,
      assistantMessage: finalText.slice(0, 500),
      durationMs,
      hasSolutionContext: !!solution_context,
      solutionTitle: solution_context?.solutionTitle,
    }).catch((err) => console.error(`[${requestId}] Log write error:`, err))

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        const chunkSize = 10
        let i = 0
        function sendChunk() {
          if (i >= finalText.length) {
            controller.close()
            return
          }
          const chunk = finalText.slice(i, i + chunkSize)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          i += chunkSize
          setTimeout(sendChunk, 8)
        }
        sendChunk()
      },
    })

    const setupTime = performance.now() - startTime
    console.log(`[${requestId}] Stream ready in ${Math.round(setupTime)}ms`)

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Request-Id": requestId,
      },
    })
  } catch (error: unknown) {
    const totalTime = performance.now() - startTime
    console.error(`[${requestId}] Error after ${Math.round(totalTime)}ms:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
