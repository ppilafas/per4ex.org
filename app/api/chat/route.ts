import { NextRequest, NextResponse } from "next/server"
import type OpenAI from "openai"
import { getSystemInstructions } from "@/lib/system-instructions"
import { getAISettings } from "@/lib/ai-config"
import { appendChatLog } from "@/lib/chat-log"
import {
  type ChatMessage,
  type SolutionContext,
  type PageContext,
  getBrainClient,
  BRAIN_TOOLS,
  executeBrainToolCall,
  buildSystemPrompt,
} from "@/lib/brain"
import { gaClientIdFromCookie } from "@/lib/ga-mp"

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

    const client = getBrainClient()
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
      tools: BRAIN_TOOLS,
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

      // GA4 client_id from the browser `_ga` cookie, to stitch the
      // server-side conversion back to the originating ad click / session.
      const gaClientId = gaClientIdFromCookie(req.cookies.get("_ga")?.value)

      // Execute each tool and append results
      for (const tc of toolCalls) {
        const args = JSON.parse(tc.arguments) as Record<string, string>
        const result = await executeBrainToolCall(tc.name, args, requestId, "Chat widget", gaClientId)
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
