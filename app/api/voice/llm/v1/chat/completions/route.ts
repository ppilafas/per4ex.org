/**
 * ElevenLabs Custom LLM shim — OpenAI-compatible streaming endpoint.
 *
 * ElevenLabs Conversational AI handles speech-to-text, turn-taking and
 * text-to-speech, then calls THIS endpoint as its "LLM". It expects an
 * OpenAI `/v1/chat/completions` SSE stream:
 *   - Content-Type: text/event-stream
 *   - each chunk: `data: <chat.completion.chunk JSON>\n\n`
 *   - terminated by `data: [DONE]\n\n`
 *
 * ElevenLabs base URL to configure in the dashboard:
 *   https://supercore.tech/api/voice/llm/v1   (it appends /chat/completions)
 *
 * The voice agent shares ONE brain with the text widget: same knowledge
 * base, system instructions, lead-capture tool and model. We replace any
 * system message ElevenLabs sends with our canonical prompt so the brain
 * stays the single source of truth, and we run the lead-capture tool loop
 * server-side here (identical to the text path) — ElevenLabs only ever
 * receives the final synthesized assistant speech.
 */

import { NextRequest } from "next/server"
import type OpenAI from "openai"
import { getSystemInstructions } from "@/lib/system-instructions"
import { getAISettings } from "@/lib/ai-config"
import { appendChatLog } from "@/lib/chat-log"
import {
  getBrainClient,
  BRAIN_TOOLS,
  executeBrainToolCall,
  buildSystemPrompt,
} from "@/lib/brain"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface IncomingMessage {
  role: string
  content: unknown
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export async function POST(req: NextRequest) {
  // ---- Auth: ElevenLabs sends the configured secret as a Bearer token ----
  const expected = process.env.VOICE_LLM_KEY
  const authHeader = req.headers.get("authorization") || ""
  const presented = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  if (!expected) {
    console.error("[voice] VOICE_LLM_KEY is not set — refusing all requests")
    return jsonError("Voice LLM not configured", 503)
  }
  if (presented !== expected) {
    return jsonError("Unauthorized", 401)
  }

  const requestId = `voice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const startTime = performance.now()

  let body: { messages?: IncomingMessage[] }
  try {
    body = await req.json()
  } catch {
    return jsonError("Invalid JSON body", 400)
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : []

  // Our brain owns the system prompt — discard ElevenLabs' system message,
  // keep only the spoken conversation turns.
  const convo = incoming
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? ""),
    }))

  const settings = await getAISettings()
  const model = settings.model
  const systemInstructions = await getSystemInstructions()
  const systemPrompt = buildSystemPrompt(systemInstructions, undefined, undefined)

  const messagesForLlm: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...convo,
  ]
  const lastUserMsg = convo.filter((m) => m.role === "user").pop()?.content || ""

  console.log(
    `[${requestId}] voice turn — model=${model}, turns=${convo.length}`
  )

  const client = getBrainClient()
  const encoder = new TextEncoder()
  const id = `chatcmpl-${requestId}`
  const created = Math.floor(Date.now() / 1000)

  const sse = (obj: unknown) =>
    encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)

  const contentChunk = (delta: string) => ({
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta: { content: delta }, finish_reason: null }],
  })

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = ""
      const emit = (delta: string) => {
        fullContent += delta
        controller.enqueue(sse(contentChunk(delta)))
      }

      try {
        // ---- First call: tools enabled, stream content live for latency ----
        const firstStream = await client.chat.completions.create({
          model,
          messages: messagesForLlm,
          tools: BRAIN_TOOLS,
          tool_choice: "auto",
          max_tokens: 512,
          temperature: 0.7,
          stream: true,
        })

        const toolCallAccum: Record<
          number,
          { id: string; name: string; arguments: string }
        > = {}
        let hasToolCalls = false

        for await (const chunk of firstStream) {
          const delta = chunk.choices[0]?.delta
          if (delta?.content) emit(delta.content)
          if (delta?.tool_calls) {
            hasToolCalls = true
            for (const tc of delta.tool_calls) {
              const idx = tc.index
              if (!toolCallAccum[idx]) {
                toolCallAccum[idx] = {
                  id: tc.id || "",
                  name: tc.function?.name || "",
                  arguments: "",
                }
              }
              if (tc.id) toolCallAccum[idx].id = tc.id
              if (tc.function?.name) toolCallAccum[idx].name = tc.function.name
              if (tc.function?.arguments)
                toolCallAccum[idx].arguments += tc.function.arguments
            }
          }
        }

        // ---- If a tool (lead capture) was requested, run it server-side ----
        if (hasToolCalls && Object.keys(toolCallAccum).length > 0) {
          const toolCalls = Object.values(toolCallAccum)
          console.log(
            `[${requestId}] TOOL: ${toolCalls.length} tool call(s) requested`
          )

          messagesForLlm.push({
            role: "assistant",
            tool_calls: toolCalls.map((tc, i) => ({
              id: tc.id || `call_${i}`,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          })

          for (const tc of toolCalls) {
            let args: Record<string, string> = {}
            try {
              args = JSON.parse(tc.arguments || "{}") as Record<string, string>
            } catch {
              args = {}
            }
            const result = await executeBrainToolCall(tc.name, args, requestId, "Voice agent")
            messagesForLlm.push({
              role: "tool",
              tool_call_id: tc.id || "call_0",
              content: result,
            })
          }

          // Follow-up synthesis — no tools, force spoken confirmation.
          const followUpStream = await client.chat.completions.create({
            model,
            messages: messagesForLlm,
            max_tokens: 512,
            temperature: 0.7,
            stream: true,
          })
          for await (const chunk of followUpStream) {
            const delta = chunk.choices[0]?.delta?.content
            if (delta) emit(delta)
          }
        }

        // ---- Terminate the OpenAI stream ----
        controller.enqueue(
          sse({
            id,
            object: "chat.completion.chunk",
            created,
            model,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          })
        )
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()

        const durationMs = Math.round(performance.now() - startTime)
        console.log(`[${requestId}] voice turn complete in ${durationMs}ms`)
        appendChatLog({
          userMessage: `[voice] ${lastUserMsg}`,
          assistantMessage: fullContent.slice(0, 500),
          durationMs,
          hasSolutionContext: false,
        }).catch((err) =>
          console.error(`[${requestId}] Log write error:`, err)
        )
      } catch (err) {
        console.error(`[${requestId}] voice shim error:`, err)
        try {
          controller.enqueue(
            sse({
              id,
              object: "chat.completion.chunk",
              created,
              model,
              choices: [
                {
                  index: 0,
                  delta: {
                    content:
                      "Sorry, I ran into a problem on my end. Could you say that again?",
                  },
                  finish_reason: "stop",
                },
              ],
            })
          )
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        } catch {
          /* controller already closed */
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Request-Id": requestId,
    },
  })
}
