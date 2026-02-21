"use client"

import { useEffect, useState } from "react"
import { VoiceWidget } from "@/components/voice-widget"
import { VoiceWidgetElevenLabs } from "@/components/voice-widget-elevenlabs"

type VoiceProvider = "catalyst" | "elevenlabs"

export function VoiceWidgetSwitcher() {
  const [provider, setProvider] = useState<VoiceProvider>("catalyst")

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/ai/settings", { cache: "no-store" })
        if (!response.ok) return
        const data = await response.json()
        if (mounted && (data?.voiceProvider === "elevenlabs" || data?.voiceProvider === "catalyst")) {
          setProvider(data.voiceProvider)
        }
      } catch {
        // Keep default provider on any fetch error
      }
    }

    loadSettings()
    return () => {
      mounted = false
    }
  }, [])

  if (provider === "elevenlabs") {
    return <VoiceWidgetElevenLabs />
  }

  return <VoiceWidget />
}
