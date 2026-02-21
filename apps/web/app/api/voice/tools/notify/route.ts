import { NextRequest, NextResponse } from "next/server"

const ELEVENLABS_AGENT_SECRET = process.env.ELEVENLABS_AGENT_SECRET

const RESEND_API_KEY = process.env.RESEND_API_KEY
const OWNER_EMAIL = process.env.OWNER_EMAIL || "ppilafas@gmail.com"

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER
const OWNER_PHONE = process.env.OWNER_PHONE

interface ToolCallPayload {
  tool_name?: string
  tool_call_id?: string
  // flat params (inline tool style — ElevenLabs sends properties directly)
  visitor_name?: string
  subject?: string
  body?: string
  message?: string
  // nested params (legacy style)
  parameters?: Record<string, string>
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

async function sendEmail(subject: string, body: string, fromName: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set — email skipped")
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Supercore Voice Agent <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      subject: `[Voice Agent] ${subject}`,
      text: `Message from visitor: ${fromName}\n\n${body}\n\n---\nSent via Supercore voice agent`,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("❌ Resend error:", res.status, text)
    return { ok: false, error: `Resend API error: ${res.status} — ${text}` }
  }

  console.log(`✅ Email sent to ${OWNER_EMAIL} — subject: ${subject}`)
  return { ok: true }
}

async function sendSms(message: string, fromName: string): Promise<{ ok: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !OWNER_PHONE) {
    console.warn("⚠️ Twilio env vars not set — SMS skipped")
    return { ok: false, error: "Twilio not configured" }
  }

  const body = `[Supercore] ${fromName}: ${message}`
  const params = new URLSearchParams({
    To: OWNER_PHONE,
    From: TWILIO_FROM_NUMBER,
    Body: body,
  })

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error("❌ Twilio error:", res.status, text)
    return { ok: false, error: `Twilio API error: ${res.status} — ${text}` }
  }

  console.log(`✅ SMS sent to ${OWNER_PHONE}`)
  return { ok: true }
}

export async function POST(req: NextRequest) {
  const reqId = `tool-${Date.now()}`

  // Log everything — headers + raw body — for debugging
  const rawBody = await req.text()
  console.log(`\n🔧 [${reqId}] TOOL WEBHOOK HIT`)
  console.log(`   URL: ${req.url}`)
  console.log(`   Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`)
  console.log(`   Raw body: ${rawBody}`)

  // Verify shared secret from ElevenLabs
  if (ELEVENLABS_AGENT_SECRET) {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")
    if (token !== ELEVENLABS_AGENT_SECRET) {
      console.warn(`❌ [${reqId}] Unauthorized — bad secret`)
      return unauthorized()
    }
  }

  let payload: ToolCallPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error(`❌ [${reqId}] Failed to parse JSON:`, rawBody)
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // ElevenLabs sends flat properties directly at the top level for inline tools
  const p = payload.parameters || {}
  const toolName = payload.tool_name
    || (req.nextUrl?.searchParams?.get("tool") ?? "")
    || (payload.subject || payload.body ? "send_email" : "send_sms")

  const visitorName = payload.visitor_name || p.visitor_name || "A visitor"
  const tool_call_id = payload.tool_call_id || "unknown"

  console.log(`🔧 [${reqId}] Resolved tool: ${toolName} | visitor: ${visitorName} | tool_call_id: ${tool_call_id}`)

  if (toolName === "send_email") {
    const subject = payload.subject || p.subject || "Message from visitor"
    const body = payload.body || p.body || payload.message || p.message || ""

    const result = await sendEmail(subject, body, visitorName)

    return NextResponse.json({
      tool_call_id,
      result: result.ok
        ? "Email sent successfully. Panagiotis will get back to you soon."
        : `Could not send email: ${result.error}`,
    })
  }

  if (toolName === "send_sms") {
    const message = payload.message || p.message || payload.body || p.body || ""

    const result = await sendSms(message, visitorName)

    return NextResponse.json({
      tool_call_id,
      result: result.ok
        ? "SMS sent successfully. Panagiotis has been notified."
        : "SMS is currently unavailable. Please offer to send an email instead using the send_email tool.",
    })
  }

  return NextResponse.json(
    { tool_call_id, result: `Unknown tool: ${toolName}` },
    { status: 400 }
  )
}
