import "server-only"

import crypto from "node:crypto"
import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "supercore_admin_session"
const SESSION_TTL_SECONDS = 60 * 60 * 24

function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || "admin"
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || ""
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || ""
}

function sign(payload: string): string {
  const secret = getSessionSecret()
  if (!secret) return ""
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

function timingSafeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function buildToken(username: string): string {
  const issuedAt = Date.now().toString()
  const payload = `${username}.${issuedAt}`
  const signature = sign(payload)
  return `${payload}.${signature}`
}

function parseToken(token: string): { username: string; issuedAt: number; signature: string } | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null

  const [username, issuedAtRaw, signature] = parts
  const issuedAt = Number(issuedAtRaw)

  if (!username || Number.isNaN(issuedAt) || !signature) return null

  return { username, issuedAt, signature }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const adminUsername = getAdminUsername()
  const adminPassword = getAdminPassword()

  if (!adminPassword) {
    console.warn("ADMIN_PASSWORD is missing; admin login is disabled.")
    return false
  }

  return timingSafeEqual(username, adminUsername) && timingSafeEqual(password, adminPassword)
}

export async function setAdminSessionCookie(username: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: buildToken(username),
    maxAge: SESSION_TTL_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  if (!token) return false

  const parsed = parseToken(token)
  if (!parsed) return false

  const expectedSignature = sign(`${parsed.username}.${parsed.issuedAt}`)
  if (!expectedSignature || !timingSafeEqual(parsed.signature, expectedSignature)) {
    return false
  }

  if (parsed.username !== getAdminUsername()) {
    return false
  }

  const ageSeconds = Math.floor((Date.now() - parsed.issuedAt) / 1000)
  if (ageSeconds > SESSION_TTL_SECONDS) {
    return false
  }

  return true
}
