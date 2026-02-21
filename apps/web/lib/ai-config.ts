import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

export type AIProvider = "catalyst" | "vercel"
export type VoiceProvider = "catalyst" | "elevenlabs"

export interface AISettings {
  aiProvider: AIProvider
  voiceProvider: VoiceProvider
  vercelAiModel: string
  openaiModel: string
  catalystApiUrl: string
  catalystTenantId: string
  catalystFallbackEnabled: boolean
  elevenlabsAgentId: string
  elevenlabsVoiceId: string
  elevenlabsModelId: string
}

export interface PublicAISettings {
  aiProvider: AIProvider
  voiceProvider: VoiceProvider
  vercelAiModel: string
  catalystFallbackEnabled: boolean
}

const SETTINGS_FILE_PATH = process.env.AI_SETTINGS_FILE_PATH || ".data/ai-settings.json"
const ABS_SETTINGS_FILE_PATH = path.resolve(process.cwd(), SETTINGS_FILE_PATH)

function parseAIProvider(value: string | undefined): AIProvider {
  return value === "vercel" ? "vercel" : "catalyst"
}

function parseVoiceProvider(value: string | undefined): VoiceProvider {
  return value === "elevenlabs" ? "elevenlabs" : "catalyst"
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value.toLowerCase() === "true"
}

function defaultsFromEnv(): AISettings {
  const vercelModel = process.env.VERCEL_AI_MODEL || "gpt-5-mini"

  return {
    aiProvider: parseAIProvider(process.env.AI_PROVIDER),
    voiceProvider: parseVoiceProvider(process.env.VOICE_PROVIDER),
    vercelAiModel: vercelModel,
    openaiModel: process.env.OPENAI_MODEL || vercelModel,
    catalystApiUrl: process.env.CATALYST_API_URL || "http://localhost:8001/v1",
    catalystTenantId: process.env.CATALYST_TENANT_ID || "catalyst_widget",
    catalystFallbackEnabled: toBoolean(process.env.CATALYST_FALLBACK_ENABLED, true),
    elevenlabsAgentId: process.env.ELEVENLABS_AGENT_ID || "",
    elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "",
    elevenlabsModelId: process.env.ELEVENLABS_MODEL_ID || "",
  }
}

function sanitizePatch(input: Partial<AISettings>): Partial<AISettings> {
  const patch: Partial<AISettings> = {}

  if (input.aiProvider !== undefined) {
    patch.aiProvider = input.aiProvider === "vercel" ? "vercel" : "catalyst"
  }

  if (input.voiceProvider !== undefined) {
    patch.voiceProvider = input.voiceProvider === "elevenlabs" ? "elevenlabs" : "catalyst"
  }

  if (typeof input.vercelAiModel === "string") {
    patch.vercelAiModel = input.vercelAiModel.trim() || "gpt-5-mini"
  }

  if (typeof input.openaiModel === "string") {
    patch.openaiModel = input.openaiModel.trim() || "gpt-5-mini"
  }

  if (typeof input.catalystApiUrl === "string") {
    patch.catalystApiUrl = input.catalystApiUrl.trim()
  }

  if (typeof input.catalystTenantId === "string") {
    patch.catalystTenantId = input.catalystTenantId.trim()
  }

  if (typeof input.catalystFallbackEnabled === "boolean") {
    patch.catalystFallbackEnabled = input.catalystFallbackEnabled
  }

  if (typeof input.elevenlabsAgentId === "string") {
    patch.elevenlabsAgentId = input.elevenlabsAgentId.trim()
  }

  if (typeof input.elevenlabsVoiceId === "string") {
    patch.elevenlabsVoiceId = input.elevenlabsVoiceId.trim()
  }

  if (typeof input.elevenlabsModelId === "string") {
    patch.elevenlabsModelId = input.elevenlabsModelId.trim()
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
    aiProvider: settings.aiProvider,
    voiceProvider: settings.voiceProvider,
    vercelAiModel: settings.vercelAiModel,
    catalystFallbackEnabled: settings.catalystFallbackEnabled,
  }
}
