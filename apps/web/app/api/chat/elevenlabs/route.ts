import { NextRequest, NextResponse } from "next/server"
import { getAISettings } from "@/lib/ai-config"

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1"

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const settings = await getAISettings()
  const agentId = settings.elevenlabsAgentId

  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 })
  }

  if (!agentId) {
    return NextResponse.json({ error: "Missing elevenlabsAgentId" }, { status: 400 })
  }

  const body = await req.json()
  const { message, conversation_id } = body

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing message" }, { status: 400 })
  }

  try {
    // Start or continue conversation
    const url = conversation_id 
      ? `${ELEVENLABS_API_BASE}/convai/conversation/${encodeURIComponent(conversation_id)}/next`
      : `${ELEVENLABS_API_BASE}/convai/conversation`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
        user_input: message,
        // Include context about being from web chat
        context: { source: "web_chat" },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("❌ ElevenLabs chat error:", response.status, text)
      return NextResponse.json({ error: `ElevenLabs API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    
    // Format response for chat widget compatibility
    return NextResponse.json({
      conversation_id: data.conversation_id,
      response: data.response,
      // Include any tool calls for debugging
      tool_calls: data.tool_calls || [],
    })
  } catch (error: unknown) {
    console.error("❌ ElevenLabs chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to chat with ElevenLabs" },
      { status: 500 }
    )
  }
}
