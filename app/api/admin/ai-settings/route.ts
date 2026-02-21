import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAISettings, updateAISettings } from "@/lib/ai-config"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized()

  const settings = await getAISettings()
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorized()

  try {
    const patch = await req.json()
    const settings = await updateAISettings(patch)
    return NextResponse.json(settings)
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    )
  }
}
