/**
 * Mints a short-lived ElevenLabs WebSocket signed URL for the browser.
 *
 * This is the fallback transport for the voice agent: WebSocket audio runs
 * over TCP 443, so it works on networks that block WebRTC (UDP/STUN/TURN —
 * common on VPNs and locked-down corporate/hotel wifi). The UI tries WebRTC
 * first for low latency and falls back here on negotiation failure.
 *
 * Same shape/guards as /api/voice/token (server-only key, per-IP limit).
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
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(
      agentId
    )}`
    const r = await fetch(url, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    })

    if (!r.ok) {
      const detail = await r.text()
      console.error("[voice/signed-url] ElevenLabs error", r.status, detail)
      return NextResponse.json(
        { error: "Failed to mint signed URL" },
        { status: 502 }
      )
    }

    const data = (await r.json()) as { signed_url?: string }
    if (!data.signed_url) {
      console.error("[voice/signed-url] No signed_url in response", data)
      return NextResponse.json(
        { error: "Failed to mint signed URL" },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { signedUrl: data.signed_url },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (err) {
    console.error("[voice/signed-url] Unexpected error", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
