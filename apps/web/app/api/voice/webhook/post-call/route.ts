import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const data = body as Record<string, unknown>
  const convId = data.conversation_id || "unknown"
  const status = data.status || "unknown"

  console.log(`\n📞 ═══════════════════════════════════════`)
  console.log(`   POST-CALL SUMMARY  [${convId}]`)
  console.log(`   Status: ${status}`)

  // Transcript
  const transcript = data.transcript as Array<{ role: string; message: string }> | undefined
  if (transcript?.length) {
    console.log(`\n   💬 TRANSCRIPT (${transcript.length} turns):`)
    for (const turn of transcript) {
      const prefix = turn.role === "user" ? "   👤" : "   🤖"
      console.log(`${prefix} ${turn.message}`)
    }
  }

  // Tool calls
  const metadata = data.metadata as Record<string, unknown> | undefined
  const toolCalls = (metadata?.tool_calls || data.tool_calls) as Array<{
    tool_name?: string
    name?: string
    parameters?: Record<string, unknown>
    result?: string
    status?: string
  }> | undefined

  if (toolCalls?.length) {
    console.log(`\n   🔧 TOOL CALLS (${toolCalls.length}):`)
    for (const tc of toolCalls) {
      const name = tc.tool_name || tc.name || "unknown"
      console.log(`   ├─ ${name}`)
      console.log(`   │  params: ${JSON.stringify(tc.parameters || {})}`)
      console.log(`   │  result: ${tc.result || "—"}`)
      console.log(`   │  status: ${tc.status || "—"}`)
    }
  }

  // Cost / duration
  const analysis = data.analysis as Record<string, unknown> | undefined
  if (analysis) {
    console.log(`\n   📊 ANALYSIS:`)
    if (analysis.transcript_summary) console.log(`   Summary: ${analysis.transcript_summary}`)
    if (analysis.call_successful !== undefined) console.log(`   Successful: ${analysis.call_successful}`)
  }

  const duration = (data.metadata as Record<string, unknown> | undefined)?.call_duration_secs
    || data.call_duration_secs
  if (duration) console.log(`\n   ⏱  Duration: ${duration}s`)

  console.log(`   ═══════════════════════════════════════\n`)

  return NextResponse.json({ ok: true })
}
