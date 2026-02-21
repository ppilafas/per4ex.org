import { NextResponse } from "next/server"
import { getAISettings } from "@/lib/ai-config"

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1"

export async function GET() {
  const settings = await getAISettings()
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 500 })
  }

  if (!settings.elevenlabsAgentId) {
    return NextResponse.json({ error: "Missing elevenlabsAgentId in runtime settings" }, { status: 400 })
  }

  const url = `${ELEVENLABS_API_BASE}/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(settings.elevenlabsAgentId)}`

  try {
    const response = await fetch(url, {
      headers: {
        "xi-api-key": apiKey,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `Failed to get signed URL: ${response.status} ${text}` }, { status: response.status })
    }

    const data = await response.json()
    if (!data?.signed_url) {
      return NextResponse.json({ error: "Signed URL missing in ElevenLabs response" }, { status: 502 })
    }

    return NextResponse.json({ signedUrl: data.signed_url, agentId: settings.elevenlabsAgentId })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bootstrap voice session" },
      { status: 500 }
    )
  }
}
