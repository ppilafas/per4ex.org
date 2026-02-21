#!/usr/bin/env node
/**
 * dev-tunnel.mjs
 *
 * Starts Next.js dev server + ngrok tunnel, then patches the ElevenLabs
 * agent's custom LLM URL to point at the tunnel so local dev works without
 * manually running ngrok or updating the ElevenLabs dashboard.
 *
 * Usage:
 *   npm run dev:tunnel
 *
 * Required env vars (in .env.local):
 *   NGROK_AUTHTOKEN        - your ngrok auth token (https://dashboard.ngrok.com/get-started/your-authtoken)
 *   ELEVENLABS_API_KEY     - your ElevenLabs API key
 *   ELEVENLABS_AGENT_ID    - your ElevenLabs agent ID
 */

import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import ngrok from "@ngrok/ngrok"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")

// ---------------------------------------------------------------------------
// Load .env.local manually (Next.js loads it for the server, but this script
// runs before Next.js starts)
// ---------------------------------------------------------------------------
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8")
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local may not exist in CI — that's fine
  }
}

loadEnv()

const NGROK_AUTHTOKEN = process.env.NGROK_AUTHTOKEN
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID
const PORT = parseInt(process.env.PORT || "3000", 10)

// ---------------------------------------------------------------------------
// Patch ElevenLabs agent custom LLM URL
// ---------------------------------------------------------------------------
async function patchElevenLabsAgent(tunnelUrl) {
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
    console.warn(
      "⚠️  ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID not set — skipping agent patch"
    )
    return
  }

  const customLlmUrl = `${tunnelUrl}/api/voice/llm`
  const agentApiUrl = `https://api.elevenlabs.io/v1/convai/agents/${ELEVENLABS_AGENT_ID}`

  console.log(`🔧 Patching ElevenLabs agent ${ELEVENLABS_AGENT_ID}`)
  console.log(`   Custom LLM URL → ${customLlmUrl}`)

  try {
    // First fetch current agent config so we only patch what we need
    const getRes = await fetch(agentApiUrl, {
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
    })

    if (!getRes.ok) {
      const text = await getRes.text()
      console.error(`❌ Failed to fetch agent config: ${getRes.status} ${text}`)
      return
    }

    const agentConfig = await getRes.json()

    // Patch the custom LLM URL inside conversation_config.agent.prompt
    const patchBody = {
      conversation_config: {
        ...(agentConfig.conversation_config || {}),
        agent: {
          ...(agentConfig.conversation_config?.agent || {}),
          prompt: {
            ...(agentConfig.conversation_config?.agent?.prompt || {}),
            llm: "custom",
            custom_llm: {
              ...(agentConfig.conversation_config?.agent?.prompt?.custom_llm || {}),
              url: customLlmUrl,
            },
          },
        },
      },
    }

    const patchRes = await fetch(agentApiUrl, {
      method: "PATCH",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchBody),
    })

    if (!patchRes.ok) {
      const text = await patchRes.text()
      console.error(`❌ Failed to patch agent: ${patchRes.status} ${text}`)
      return
    }

    console.log(`✅ ElevenLabs agent patched — custom LLM URL set to tunnel`)
  } catch (err) {
    console.error("❌ Error patching ElevenLabs agent:", err.message)
  }
}

// ---------------------------------------------------------------------------
// Start Next.js dev server
// ---------------------------------------------------------------------------
function startNextDev() {
  console.log(`🚀 Starting Next.js dev server on port ${PORT}...`)
  const next = spawn("npx", ["next", "dev", "--port", String(PORT)], {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: process.env,
  })

  next.on("error", (err) => {
    console.error("❌ Failed to start Next.js:", err.message)
    process.exit(1)
  })

  return next
}

// ---------------------------------------------------------------------------
// Wait for Next.js to be ready
// ---------------------------------------------------------------------------
async function waitForNextJs(port, maxWaitMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`http://localhost:${port}/`)
      if (res.status < 500) return true
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  if (!NGROK_AUTHTOKEN) {
    console.error(
      "❌ NGROK_AUTHTOKEN is not set.\n" +
        "   Add it to .env.local:\n" +
        "   NGROK_AUTHTOKEN=your_token_here\n" +
        "   Get your token at: https://dashboard.ngrok.com/get-started/your-authtoken"
    )
    process.exit(1)
  }

  const nextProcess = startNextDev()

  // Give Next.js a moment to start, then open the tunnel
  console.log("⏳ Waiting for Next.js to be ready...")
  const ready = await waitForNextJs(PORT)
  if (!ready) {
    console.error("❌ Next.js did not become ready in time")
    nextProcess.kill()
    process.exit(1)
  }

  console.log("✅ Next.js is ready")
  console.log("🌐 Opening ngrok tunnel...")

  const listener = await ngrok.forward({
    addr: PORT,
    authtoken: NGROK_AUTHTOKEN,
  })

  const tunnelUrl = listener.url()
  console.log(`\n🔗 ngrok tunnel: ${tunnelUrl}`)
  console.log(`   Local:         http://localhost:${PORT}\n`)

  await patchElevenLabsAgent(tunnelUrl)

  console.log("\n✨ Ready for ElevenLabs voice testing!")
  console.log("   Press Ctrl+C to stop\n")

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n🛑 Shutting down...")
    await ngrok.disconnect()
    nextProcess.kill()
    process.exit(0)
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

main().catch((err) => {
  console.error("💥 Fatal error:", err)
  process.exit(1)
})
