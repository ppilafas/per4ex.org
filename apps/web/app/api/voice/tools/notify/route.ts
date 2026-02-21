import { NextRequest, NextResponse } from "next/server"

const ELEVENLABS_AGENT_SECRET = process.env.ELEVENLABS_AGENT_SECRET

const RESEND_API_KEY = process.env.RESEND_API_KEY
const OWNER_EMAIL = process.env.OWNER_EMAIL || "pi@supercore.tech"

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER
const OWNER_PHONE = process.env.OWNER_PHONE

interface ToolCallPayload {
  tool_name: string
  tool_call_id: string
  parameters: Record<string, string>
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
      from: "Supercore Voice Agent <agent@supercore.tech>",
      to: [OWNER_EMAIL],
      subject: `[Voice Agent] ${subject}`,
      text: `Message from visitor: ${fromName}\n\n${body}\n\n---\nSent via Supercore voice agent`,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("❌ Resend error:", text)
    return { ok: false, error: `Resend API error: ${res.status}` }
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
    console.error("❌ Twilio error:", text)
    return { ok: false, error: `Twilio API error: ${res.status}` }
  }

  console.log(`✅ SMS sent to ${OWNER_PHONE}`)
  return { ok: true }
}

export async function POST(req: NextRequest) {
  // Verify shared secret from ElevenLabs
  if (ELEVENLABS_AGENT_SECRET) {
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace(/^Bearer\s+/i, "")
    if (token !== ELEVENLABS_AGENT_SECRET) {
      console.warn("❌ Voice tools notify: unauthorized request")
      return unauthorized()
    }
  }

  let payload: ToolCallPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { tool_name, tool_call_id, parameters } = payload
  console.log(`🔧 Voice tool call: ${tool_name}`, parameters)

  if (tool_name === "send_email") {
    const subject = parameters.subject || "Message from visitor"
    const body = parameters.body || parameters.message || ""
    const fromName = parameters.visitor_name || "A visitor"

    const result = await sendEmail(subject, body, fromName)

    return NextResponse.json({
      tool_call_id,
      result: result.ok
        ? "Email sent successfully. Panagiotis will get back to you soon."
        : `Could not send email: ${result.error}`,
    })
  }

  if (tool_name === "send_sms") {
    const message = parameters.message || parameters.body || ""
    const fromName = parameters.visitor_name || "A visitor"

    const result = await sendSms(message, fromName)

    return NextResponse.json({
      tool_call_id,
      result: result.ok
        ? "SMS sent successfully. Panagiotis has been notified."
        : `Could not send SMS: ${result.error}`,
    })
  }

  return NextResponse.json(
    { tool_call_id, result: `Unknown tool: ${tool_name}` },
    { status: 400 }
  )
}
