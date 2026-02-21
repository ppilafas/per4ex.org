import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export interface AISettings {
  model: string
}

export interface PublicAISettings {
  model: string
}

const SETTINGS_FILE_PATH = process.env.AI_SETTINGS_FILE_PATH || ".data/ai-settings.json"
const ABS_SETTINGS_FILE_PATH = path.resolve(process.cwd(), SETTINGS_FILE_PATH)

function defaultsFromEnv(): AISettings {
  return {
    model: process.env.AI_MODEL || "gemini-2.0-flash",
  }
}

function sanitizePatch(input: Partial<AISettings>): Partial<AISettings> {
  const patch: Partial<AISettings> = {}
  if (typeof input.model === "string") {
    patch.model = input.model.trim() || "gemini-2.0-flash"
  }
  return patch
}

async function readSettingsFile(): Promise<Partial<AISettings>> {
  try {
    const raw = await readFile(ABS_SETTINGS_FILE_PATH, "utf8")
    return JSON.parse(raw) as Partial<AISettings>
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : ""

    if (code === "ENOENT") {
      return {}
    }

    console.error("Failed reading AI settings file:", error)
    return {}
  }
}

async function writeSettingsFile(settings: AISettings): Promise<void> {
  const dir = path.dirname(ABS_SETTINGS_FILE_PATH)
  await mkdir(dir, { recursive: true })
  await writeFile(ABS_SETTINGS_FILE_PATH, `${JSON.stringify(settings, null, 2)}\n`, "utf8")
}

export async function getAISettings(): Promise<AISettings> {
  const envDefaults = defaultsFromEnv()
  const fileSettings = sanitizePatch(await readSettingsFile())

  return {
    ...envDefaults,
    ...fileSettings,
  }
}

export async function updateAISettings(input: Partial<AISettings>): Promise<AISettings> {
  const current = await getAISettings()
  const patch = sanitizePatch(input)
  const merged: AISettings = {
    ...current,
    ...patch,
  }

  await writeSettingsFile(merged)
  return merged
}

export async function getPublicAISettings(): Promise<PublicAISettings> {
  const settings = await getAISettings()
  return {
    model: settings.model,
  }
}
