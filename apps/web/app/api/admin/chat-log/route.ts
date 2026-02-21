import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getChatLog, clearChatLog } from "@/lib/chat-log"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized()
  const log = await getChatLog()
  return NextResponse.json({ entries: log.reverse() })
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) return unauthorized()
  await clearChatLog()
  return NextResponse.json({ ok: true })
}
