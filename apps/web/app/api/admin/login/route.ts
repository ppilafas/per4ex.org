import { NextRequest, NextResponse } from "next/server"
import { setAdminSessionCookie, verifyAdminCredentials } from "@/lib/admin-auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = typeof body?.username === "string" ? body.username : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 })
    }

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await setAdminSessionCookie(username)
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
}
