import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { KNOWLEDGE_BASE_CONTEXT } from "@/lib/knowledge-base"
import { getSystemInstructions } from "@/lib/system-instructions"
import { getAISettings } from "@/lib/ai-config"
import { appendChatLog } from "@/lib/chat-log"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// OpenAI-compatible client pointed at HuggingFace Router
// ---------------------------------------------------------------------------

function getClient(): OpenAI {
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

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "send_widget_contact_email",
      description:
        "Send a contact email to Panagiotis. Call this immediately when the user provides their email and wants to contact Panagiotis. Do not ask for confirmation.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Visitor name (use 'Guest' if not provided)",
          },
          email: {
            type: "string",
            description: "Visitor email address - REQUIRED",
          },
          message: {
            type: "string",
            description: "Message content (use 'Inquiry from Chat Widget' if not provided)",
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

async function executeToolCall(
  name: string,
  args: Record<string, string>,
  requestId: string
): Promise<string> {
  if (name !== "send_widget_contact_email") {
    return `Unknown tool: ${name}`
  }

  const { name: visitorName = "Guest", email, message = "Inquiry from Chat Widget" } = args
  console.log(`[${requestId}] TOOL: send_widget_contact_email called with email=${email}, name=${visitorName}`)

  const resendKey = process.env.RESEND_API_KEY
  const ownerEmail = process.env.OWNER_EMAIL || "ppilafas@gmail.com"
  if (!resendKey) {
    console.log(`[${requestId}] TOOL: Email service not configured`)
    return "Email service not configured."
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Supercore Chat <onboarding@resend.dev>",
      to: [ownerEmail],
      subject: `[Chat] Message from ${visitorName}`,
      text: `From: ${visitorName} <${email}>\n\n${message}\n\n---\nSent via Supercore chat widget`,
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
// System prompt builder (unchanged logic)
// ---------------------------------------------------------------------------

function buildSystemPrompt(
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

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

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

    const client = getClient()
    const settings = await getAISettings()
    const model = settings.model
    const systemInstructions = await getSystemInstructions()
    const systemPrompt = buildSystemPrompt(
      systemInstructions,
      solution_context as SolutionContext | undefined,
      page_context as PageContext | undefined
    )

    console.log(`[${requestId}] Using model=${model} via HuggingFace Router`)

    const lastUserMsg = (messages as ChatMessage[]).filter((m) => m.role === "user").pop()?.content || ""

    const messagesForLlm: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(messages as ChatMessage[]).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ]

    // ------------------------------------------------------------------
    // Single streaming call with tools.
    // We accumulate tool_call deltas. If the model wants a tool, we
    // execute it and make one follow-up streaming call for synthesis.
    // For normal messages this is a single API request.
    // ------------------------------------------------------------------

    const firstStream = await client.chat.completions.create({
      model,
      messages: messagesForLlm,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 512,
      temperature: 0.7,
      stream: true,
    })

    const encoder = new TextEncoder()
    let fullContent = ""

    // Accumulate content and tool calls from the stream
    let streamedContent = ""
    const toolCallAccum: Record<number, { id: string; name: string; arguments: string }> = {}
    let hasToolCalls = false

    for await (const chunk of firstStream) {
      const delta = chunk.choices[0]?.delta

      // Accumulate content deltas
      if (delta?.content) {
        streamedContent += delta.content
      }

      // Accumulate tool_call deltas
      if (delta?.tool_calls) {
        hasToolCalls = true
        for (const tc of delta.tool_calls) {
          const idx = tc.index
          if (!toolCallAccum[idx]) {
            toolCallAccum[idx] = { id: tc.id || "", name: tc.function?.name || "", arguments: "" }
          }
          if (tc.id) toolCallAccum[idx].id = tc.id
          if (tc.function?.name) toolCallAccum[idx].name = tc.function.name
          if (tc.function?.arguments) toolCallAccum[idx].arguments += tc.function.arguments
        }
      }
    }

    // ------------------------------------------------------------------
    // If tool calls were requested, execute them and stream follow-up
    // ------------------------------------------------------------------
    if (hasToolCalls && Object.keys(toolCallAccum).length > 0) {
      const toolCalls = Object.values(toolCallAccum)
      console.log(`[${requestId}] TOOL: ${toolCalls.length} tool call(s) requested`)

      // Build proper assistant message with tool_calls
      messagesForLlm.push({
        role: "assistant",
        tool_calls: toolCalls.map((tc, i) => ({
          id: tc.id || `call_${i}`,
          type: "function" as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      })

      // Execute each tool and append results
      for (const tc of toolCalls) {
        const args = JSON.parse(tc.arguments) as Record<string, string>
        const result = await executeToolCall(tc.name, args, requestId)
        messagesForLlm.push({
          role: "tool",
          tool_call_id: tc.id || "call_0",
          content: result,
        })
      }

      // Stream the follow-up synthesis (no tools — force text)
      const followUpStream = await client.chat.completions.create({
        model,
        messages: messagesForLlm,
        max_tokens: 512,
        temperature: 0.7,
        stream: true,
      })

      const sseStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of followUpStream) {
              const delta = chunk.choices[0]?.delta?.content
              if (delta) {
                fullContent += delta
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
              }
            }
            controller.close()

            const durationMs = Math.round(performance.now() - startTime)
            console.log(`[${requestId}] Stream complete in ${durationMs}ms (tool executed)`)

            appendChatLog({
              userMessage: lastUserMsg,
              assistantMessage: fullContent.slice(0, 500),
              durationMs,
              hasSolutionContext: !!solution_context,
              solutionTitle: solution_context?.solutionTitle,
            }).catch((err) => console.error(`[${requestId}] Log write error:`, err))
          } catch (err) {
            console.error(`[${requestId}] Stream error:`, err)
            controller.error(err)
          }
        },
      })

      return new NextResponse(sseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Request-Id": requestId,
        },
      })
    }

    // ------------------------------------------------------------------
    // No tool calls — stream the already-received content to the client
    // ------------------------------------------------------------------
    fullContent = streamedContent

    const sseStream = new ReadableStream({
      start(controller) {
        // Content was already fully received — send it in small chunks for
        // a smooth typing effect on the frontend
        const chunkSize = 20
        let i = 0
        function sendChunk() {
          if (i >= fullContent.length) {
            controller.close()
            return
          }
          const chunk = fullContent.slice(i, i + chunkSize)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          i += chunkSize
          // Use queueMicrotask for fast but non-blocking delivery
          setTimeout(sendChunk, 5)
        }
        sendChunk()

        const durationMs = Math.round(performance.now() - startTime)
        console.log(`[${requestId}] Stream complete in ${durationMs}ms`)

        appendChatLog({
          userMessage: lastUserMsg,
          assistantMessage: fullContent.slice(0, 500),
          durationMs,
          hasSolutionContext: !!solution_context,
          solutionTitle: solution_context?.solutionTitle,
        }).catch((err) => console.error(`[${requestId}] Log write error:`, err))
      },
    })

    return new NextResponse(sseStream, {
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
