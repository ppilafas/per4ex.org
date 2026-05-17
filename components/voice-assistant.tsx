"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ConversationProvider, useConversation } from "@elevenlabs/react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, PhoneOff, Loader2, AudioLines, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Simple, dashboard-equivalent flow: mint a WebRTC conversation token, start
// the session, let the SDK connect, and reflect real status/errors. No
// client-side watchdogs or premature endSession() — those were tearing down
// a connection mid-negotiation.
// ---------------------------------------------------------------------------

type UiState = "idle" | "connecting" | "live" | "failed"

function VoicePanel() {
  const [uiState, setUiState] = useState<UiState>("idle")
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  const conv = useConversation({
    onConnect: () => {
      setError(null)
      setUiState("live")
    },
    onDisconnect: () => {
      startedRef.current = false
      setUiState((s) => (s === "failed" ? s : "idle"))
    },
    onError: (message: string) => {
      startedRef.current = false
      setError(message || "Voice connection error.")
      setUiState("failed")
    },
  })

  const start = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true
    setError(null)
    setUiState("connecting")
    try {
      const res = await fetch("/api/voice/token")
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `Could not start (${res.status})`)
      }
      const { token } = (await res.json()) as { token: string }
      await conv.startSession({
        conversationToken: token,
        connectionType: "webrtc",
      })
    } catch (e) {
      startedRef.current = false
      setError(
        e instanceof Error ? e.message : "Could not start the call. Try again."
      )
      setUiState("failed")
    }
  }, [conv])

  const stop = useCallback(() => {
    conv.endSession()
    startedRef.current = false
    setUiState("idle")
  }, [conv])

  // Only tear down on unmount if a session is actually active.
  useEffect(() => {
    return () => {
      if (startedRef.current) conv.endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connecting = uiState === "connecting"
  const live = uiState === "live"
  const failed = uiState === "failed"
  const isSpeaking = conv.isSpeaking

  const stateLabel = connecting
    ? "Connecting…"
    : live
      ? isSpeaking
        ? "Catalyst is speaking…"
        : "Listening — go ahead"
      : failed
        ? "Couldn't connect"
        : "Ready when you are"

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={live ? stop : connecting ? undefined : start}
        disabled={connecting}
        aria-label={live ? "End voice call" : "Start voice call"}
        className={cn(
          "group relative flex h-28 w-28 items-center justify-center rounded-full border transition-colors",
          live
            ? "border-accent/60 bg-accent/10"
            : "border-white/15 bg-white/[0.03] hover:border-accent/50",
          connecting && "cursor-wait opacity-80"
        )}
      >
        <AnimatePresence>
          {live && (
            <motion.span
              key="pulse"
              className="absolute inset-0 rounded-full bg-accent/15"
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{
                scale: isSpeaking ? [1, 1.35, 1] : [1, 1.12, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: isSpeaking ? 1.1 : 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </AnimatePresence>

        {connecting ? (
          <Loader2 className="h-9 w-9 animate-spin text-accent" />
        ) : live ? (
          <AudioLines
            className={cn("h-9 w-9 text-accent", isSpeaking && "animate-pulse")}
          />
        ) : (
          <Mic className="h-9 w-9 text-foreground transition-colors group-hover:text-accent" />
        )}
      </button>

      <p
        className={cn(
          "max-w-xs text-sm font-medium",
          live ? "text-accent" : failed ? "text-red-300" : "text-muted"
        )}
        aria-live="polite"
      >
        {stateLabel}
      </p>

      {live && (
        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-foreground transition-colors hover:border-red-500/60 hover:text-red-400"
        >
          <PhoneOff className="h-4 w-4" />
          End call
        </button>
      )}

      {failed && (
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
        >
          Try again
        </button>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper (exported)
// ---------------------------------------------------------------------------

export function VoiceAssistantSection() {
  return (
    <section
      id="assistant"
      className="scroll-mt-28 border-y border-white/5 bg-[#0a0a0a] py-16 md:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
          Talk to my assistant
        </p>
        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          Ask Catalyst about my work — out loud.
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Catalyst briefs you on my projects and takes down your details if
          you&apos;d like a follow-up. It isn&apos;t a widget I bolted on — the
          voice and text assistants run on one shared brain behind a custom-LLM
          gateway, with server-side lead capture. This page is the demo:
          it&apos;s the kind of voice system I build for clients.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 md:p-10">
          <ConversationProvider>
            <VoicePanel />
          </ConversationProvider>
        </div>

        <p className="mt-4 text-xs text-muted/60">
          Uses your microphone. Live demo — please keep it brief.
        </p>
      </div>
    </section>
  )
}
