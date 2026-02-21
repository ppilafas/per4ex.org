import { NextResponse } from "next/server"
import { getPublicAISettings } from "@/lib/ai-config"

export async function GET() {
  const settings = await getPublicAISettings()
  return NextResponse.json(settings)
}
