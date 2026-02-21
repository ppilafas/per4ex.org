import "server-only"

import { readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"

export interface ChatLogEntry {
  id: string
  ts: string
  userMessage: string
  assistantMessage: string
  durationMs: number
  hasSolutionContext: boolean
  solutionTitle?: string
}

const LOG_FILE = path.resolve(process.cwd(), ".data/chat-log.json")
const MAX_ENTRIES = 200

async function readLog(): Promise<ChatLogEntry[]> {
  try {
    const raw = await readFile(LOG_FILE, "utf8")
    return JSON.parse(raw) as ChatLogEntry[]
  } catch {
    return []
  }
}

async function writeLog(entries: ChatLogEntry[]): Promise<void> {
  const dir = path.dirname(LOG_FILE)
  await mkdir(dir, { recursive: true })
  await writeFile(LOG_FILE, JSON.stringify(entries, null, 2), "utf8")
}

export async function appendChatLog(entry: Omit<ChatLogEntry, "id" | "ts">): Promise<void> {
  const entries = await readLog()
  entries.push({
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts: new Date().toISOString(),
  })
  // Keep only the last MAX_ENTRIES
  const trimmed = entries.slice(-MAX_ENTRIES)
  await writeLog(trimmed)
}

export async function getChatLog(): Promise<ChatLogEntry[]> {
  return readLog()
}

export async function clearChatLog(): Promise<void> {
  await writeLog([])
}
