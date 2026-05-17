"use client"

import dynamic from "next/dynamic"

// The ElevenLabs WebRTC SDK is browser-only — load it client-side, no SSR.
const VoiceAssistantSection = dynamic(
  () =>
    import("@/components/voice-assistant").then((m) => m.VoiceAssistantSection),
  {
    ssr: false,
    loading: () => (
      <section className="border-y border-white/5 bg-[#0a0a0a] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto h-48 max-w-md animate-pulse rounded-2xl border border-white/10 bg-white/[0.025]" />
        </div>
      </section>
    ),
  }
)

export function VoiceAssistantMount() {
  return <VoiceAssistantSection />
}
