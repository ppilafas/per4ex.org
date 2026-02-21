import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getSystemInstructions, updateSystemInstructions } from "@/lib/system-instructions"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized()

  const instructions = await getSystemInstructions()
  return NextResponse.json({ instructions })
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorized()

  try {
    const body = (await req.json()) as { instructions?: unknown }
    const instructions = typeof body.instructions === "string" ? body.instructions : ""
    const updated = await updateSystemInstructions(instructions)
    return NextResponse.json({ instructions: updated })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save instructions" },
      { status: 500 }
    )
  }
}
