import { NextRequest, NextResponse } from "next/server"
import { getSystemInstructions } from "@/lib/system-instructions"
import { KNOWLEDGE_BASE_CONTEXT } from "@/lib/knowledge-base"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ELEVENLABS_AGENT_SECRET = process.env.ELEVENLABS_AGENT_SECRET
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID

interface OAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

async function retrieveRAGContext(query: string, requestId: string): Promise<string> {
  if (!OPENAI_API_KEY || !VECTOR_STORE_ID) {
    console.log(`⚠️ [${requestId}] RAG disabled: missing OPENAI_API_KEY or VECTOR_STORE_ID`)
    return KNOWLEDGE_BASE_CONTEXT
  }

  const startTime = performance.now()
  
  try {
    console.log(`🔍 [${requestId}] Querying Vector Store for voice context...`)
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: query,
        tools: [{
          type: 'file_search',
          vector_store_ids: [VECTOR_STORE_ID],
          max_num_results: 3  // Fewer results for voice to reduce latency
        }],
        tool_choice: 'required'
      }),
    })

    if (!response.ok) {
      console.log(`⚠️ [${requestId}] Vector Store query failed, using static KB`)
      return KNOWLEDGE_BASE_CONTEXT
    }

    const data = await response.json()
    const toolCall = data.output?.find((item: { type: string }) => item.type === 'file_search_call')
    
    if (!toolCall || !toolCall.results || toolCall.results.length === 0) {
      console.log(`⚠️ [${requestId}] No RAG results, using static KB`)
      return KNOWLEDGE_BASE_CONTEXT
    }

    const ragTime = performance.now() - startTime
    const chunks = toolCall.results.map((result: { attributes?: { text?: string } }) => 
      result.attributes?.text || ''
    ).filter(Boolean)

    const context = `KNOWLEDGE BASE CONTEXT (Retrieved):\n${chunks.join('\n\n')}\n\nUse this information to answer the user's question accurately.`
    
    console.log(`✅ [${requestId}] RAG retrieved ${chunks.length} chunks in ${Math.round(ragTime)}ms`)
    return context
  } catch (error) {
    console.error(`💥 [${requestId}] RAG retrieval error:`, error)
    return KNOWLEDGE_BASE_CONTEXT
  }
}

// ElevenLabs probes with HEAD before using the endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function POST(req: NextRequest) {
  const reqId = `llm-${Date.now()}`
  console.log(`\n🎙️ [${reqId}] ElevenLabs custom LLM request received`)
  console.log(`   Method: ${req.method}`)
  console.log(`   Headers: content-type=${req.headers.get("content-type")} auth=${req.headers.get("authorization") ? "present" : "none"}`)

  // Optional: verify shared secret
  if (ELEVENLABS_AGENT_SECRET) {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")
    if (token !== ELEVENLABS_AGENT_SECRET) {
      console.log(`❌ [${reqId}] Unauthorized — bad secret`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let body: { messages?: OAIMessage[]; stream?: boolean; model?: string }
  try {
    body = await req.json()
    console.log(`📦 [${reqId}] Body parsed: model=${body.model} stream=${body.stream} messages=${body.messages?.length}`)
  } catch (e) {
    console.log(`❌ [${reqId}] Failed to parse JSON body:`, e)
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const messages: OAIMessage[] = body.messages || []
  const isStreaming = body.stream === true

  const lastUser = [...messages].reverse().find((m) => m.role === "user")
  const userQuery = lastUser?.content || ""
  console.log(`🔍 [${reqId}] User query: "${userQuery.slice(0, 80)}" | streaming=${isStreaming}`)

  // Short-circuit silence/noise transcriptions
  const isNoise = !userQuery.trim() || /^\.{1,5}$/.test(userQuery.trim())
  if (isNoise) {
    console.log(`⏭️ [${reqId}] Noise/silence detected — skipping LLM call`)
    if (isStreaming) {
      // Must return SSE stream format when streaming is expected
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // Send empty content chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: reqId, object: "chat.completion.chunk", choices: [{ delta: { content: "" }, finish_reason: null, index: 0 }] })}\n\n`))
          // Send finish chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ id: reqId, object: "chat.completion.chunk", choices: [{ delta: {}, finish_reason: "stop", index: 0 }] })}\n\n`))
          // Send [DONE]
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        },
      })
      return new NextResponse(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      })
    }
    const empty = { id: reqId, object: "chat.completion", choices: [{ message: { role: "assistant", content: "" }, finish_reason: "stop", index: 0 }] }
    return NextResponse.json(empty)
  }

  console.log(`⏳ [${reqId}] Fetching system instructions...`)
  const systemInstructions = await getSystemInstructions()
  console.log(`✅ [${reqId}] Context ready — instructions=${systemInstructions.length}chars`)

  const enrichedSystem = `${systemInstructions}

VOICE CONVERSATION GUIDELINES:
- You are speaking via voice — keep responses concise and conversational (2-3 sentences max unless detail is needed)
- Avoid markdown formatting, bullet points, or code blocks — speak naturally
- Do not read out URLs or long technical strings verbatim
- Use the knowledge base provided by ElevenLabs (crawled from supercore.tech) to answer questions about projects, capabilities, and technical details
- If you don't have enough information, offer to connect the user with Panagiotis

NOTE: ElevenLabs provides you with knowledge base context from the crawled website. Use that information to answer questions accurately.`

  console.log(`📝 [${reqId}] System prompt preview (first 500 chars):`)
  console.log(enrichedSystem.slice(0, 500))

  const enrichedMessages: OAIMessage[] = [
    { role: "system", content: enrichedSystem },
    ...messages.filter((m) => m.role !== "system"),
  ]

  console.log(`📨 [${reqId}] Messages being sent to OpenAI:`)
  enrichedMessages.forEach((msg, idx) => {
    const preview = msg.content.slice(0, 100).replace(/\n/g, ' ')
    console.log(`   [${idx}] ${msg.role}: ${preview}${msg.content.length > 100 ? '...' : ''}`)
  })

  console.log(`🤖 [${reqId}] Calling OpenAI chat/completions (model=${body.model || "gpt-4o-mini"} stream=${isStreaming})...`)
  let openaiResponse: Response
  try {
    openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: enrichedMessages,
        stream: isStreaming,
      }),
    })
  } catch (e) {
    console.error(`❌ [${reqId}] OpenAI fetch threw:`, e)
    return NextResponse.json({ error: "OpenAI fetch failed" }, { status: 502 })
  }

  console.log(`📥 [${reqId}] OpenAI response: ${openaiResponse.status}`)

  if (!openaiResponse.ok) {
    const err = await openaiResponse.text()
    console.error(`❌ [${reqId}] OpenAI error ${openaiResponse.status}: ${err.slice(0, 200)}`)
    return NextResponse.json(
      { error: `OpenAI error: ${openaiResponse.status} ${err}` },
      { status: openaiResponse.status }
    )
  }

  if (isStreaming) {
    console.log(`🌊 [${reqId}] Streaming response back to ElevenLabs`)
    
    // Create a transform stream to log chunks as they pass through
    const { readable, writable } = new TransformStream()
    const reader = openaiResponse.body!.getReader()
    const writer = writable.getWriter()
    const decoder = new TextDecoder()
    let fullResponse = ''
    
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          
          // Log first few chunks to see what's being streamed
          if (fullResponse.length < 500) {
            console.log(`📦 [${reqId}] Chunk: ${chunk.slice(0, 100)}`)
          }
          
          await writer.write(value)
        }
        console.log(`✅ [${reqId}] Streaming complete. Total response length: ${fullResponse.length} chars`)
        console.log(`📄 [${reqId}] Response preview: ${fullResponse.slice(0, 300)}`)
        await writer.close()
      } catch (error) {
        console.error(`❌ [${reqId}] Streaming error:`, error)
        await writer.abort(error)
      }
    })()
    
    return new NextResponse(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  }

  const data = await openaiResponse.json()
  console.log(`✅ [${reqId}] Non-streaming response sent (${JSON.stringify(data).length} chars)`)
  console.log(`📄 [${reqId}] Response content: ${data.choices?.[0]?.message?.content?.slice(0, 200)}`)
  return NextResponse.json(data)
}
