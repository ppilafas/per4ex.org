import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { event, data } = await req.json() as { event: string; data?: Record<string, unknown> }
    const ts = new Date().toISOString().slice(11, 23)

    switch (event) {
      case "connect":
        console.log(`\n💬 [TextChat ${ts}] ✅ Connected to ElevenLabs agent`)
        break
      case "disconnect":
        console.log(`💬 [TextChat ${ts}] ⚠️  Disconnected from ElevenLabs agent`)
        break
      case "send":
        console.log(`💬 [TextChat ${ts}] 📤 User: "${String(data?.text ?? "").slice(0, 120)}"`)
        break
      case "receive":
        console.log(`💬 [TextChat ${ts}] 📥 Agent: "${String(data?.text ?? "").slice(0, 120)}"`)
        break
      case "error":
        console.error(`💬 [TextChat ${ts}] ❌ Error:`, data?.message)
        break
      default:
        console.log(`💬 [TextChat ${ts}] ℹ️  ${event}`, data ?? "")
    }
  } catch {
    // ignore malformed log calls
  }

  return NextResponse.json({ ok: true })
}
