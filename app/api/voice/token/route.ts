/**
 * Mints a short-lived ElevenLabs WebRTC conversation token for the browser.
 *
 * The ElevenLabs API key never leaves the server. This route is also the
 * choke point for abuse/cost control — every token = a billable voice
 * session, so it carries a lightweight per-IP rate limit (Phase 4 hardens
 * this with a shared store; the in-memory map below is per-instance only).
 */

import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const agentId = process.env.ELEVENLABS_AGENT_ID
  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "Voice agent not configured" },
      { status: 503 }
    )
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment." },
      { status: 429 }
    )
  }

  try {
    const url = `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(
      agentId
    )}`
    const r = await fetch(url, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    })

    if (!r.ok) {
      const detail = await r.text()
      console.error("[voice/token] ElevenLabs error", r.status, detail)
      return NextResponse.json(
        { error: "Failed to mint voice token" },
        { status: 502 }
      )
    }

    const data = (await r.json()) as { token?: string }
    if (!data.token) {
      console.error("[voice/token] No token in ElevenLabs response", data)
      return NextResponse.json(
        { error: "Failed to mint voice token" },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { token: data.token },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("[voice/token] Unexpected error", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
