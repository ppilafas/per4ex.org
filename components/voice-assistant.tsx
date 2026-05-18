"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useConversation } from "@elevenlabs/react"
import { motion, AnimatePresence } from "framer-motion"
import { Microphone as Mic, PhoneSlash as PhoneOff, CircleNotch as Loader2, PaperPlaneTilt as Send, WarningCircle as AlertCircle, ArrowCounterClockwise as RotateCcw, ChatCircle as MessageSquare } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Inline conversational UX: a live transcript (voice + typed) plus a text
// input — same shape as the ElevenLabs dashboard tester. One ElevenLabs
// session at a time; first action picks the mode:
//   - mic   -> voice session (WebRTC conversation token)
//   - typing -> text-only session (WebSocket signed URL)
// Both route through our custom-LLM shim (shared brain).
// ---------------------------------------------------------------------------

type Turn = {
  id: number
  role: "user" | "agent"
  text: string
  order: number
  optimistic?: boolean
}
type UiState = "idle" | "connecting" | "live" | "failed"

let turnSeq = 0
// Placeholder/interim noise the SDK can emit (e.g. a lone "..." while
// transcribing) — never worth a bubble.
const isNoise = (t: string) => /^[.…\s]*$/.test(t)

const WAVE_BARS = 28

// Reactive waveform driven by the SDK's real byte-frequency data
// (agent output while speaking, mic input while listening).
function Waveform({
  getData,
  active,
}: {
  getData: () => Uint8Array | null
  active: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const render = () => {
      const row = rowRef.current
      if (row) {
        const data = getData()
        const bars = row.children
        for (let i = 0; i < bars.length; i++) {
          let v = 0.08
          if (data && data.length) {
            const idx = Math.floor((i / WAVE_BARS) * data.length)
            v = Math.max(0.08, Math.min(1, data[idx] / 255))
          }
          ;(bars[i] as HTMLElement).style.transform = `scaleY(${v.toFixed(3)})`
        }
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [active, getData])

  return (
    <div
      ref={rowRef}
      aria-hidden
      className="flex h-9 items-center justify-center gap-[3px]"
    >
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-center rounded-full bg-accent/70"
          style={{ transform: "scaleY(0.08)" }}
        />
      ))}
    </div>
  )
}

export function VoicePanel() {
  const [uiState, setUiState] = useState<UiState>("idle")
  const [mode, setMode] = useState<"voice" | "text" | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const conv = useConversation({
    onConnect: () => {
      setError(null)
      setUiState("live")
    },
    onDisconnect: () => {
      startedRef.current = false
      setUiState((s) => (s === "failed" ? s : "idle"))
      setMode(null)
    },
    onError: (message: string) => {
      startedRef.current = false
      setError(message || "Voice connection error.")
      setUiState("failed")
    },
    onMessage: ({
      message,
      role,
      event_id,
    }: {
      message: string
      role: "user" | "agent"
      event_id?: number
    }) => {
      const text = (message || "").trim()
      if (!text || isNoise(text)) return
      // Order by the SDK's conversation-wide event_id, NOT arrival order:
      // the final user transcript can land after the agent's reply.
      const order =
        typeof event_id === "number" ? event_id : ++arrivalRef.current
      if (typeof event_id === "number" && event_id > maxOrderRef.current) {
        maxOrderRef.current = event_id
      }
      setTurns((prev) => {
        // If this echoes a typed message we already showed optimistically,
        // reconcile it (adopt the real order) instead of duplicating.
        if (role === "user") {
          const opt = prev.find(
            (t) => t.optimistic && t.role === "user" && t.text === text
          )
          if (opt) {
            return prev
              .map((t) =>
                t === opt ? { ...t, order, optimistic: false } : t
              )
              .sort((a, b) => a.order - b.order || a.id - b.id)
          }
        }
        const next = [...prev, { id: ++turnSeq, role, text, order }]
        next.sort((a, b) => a.order - b.order || a.id - b.id)
        return next
      })
    },
  })

  const arrivalRef = useRef(1_000_000_000)
  // Highest real event_id seen — typed turns slot just after it so they
  // render before the agent's forthcoming reply (which gets a higher id).
  const maxOrderRef = useRef(0)
  const addTypedTurn = useCallback((text: string) => {
    setTurns((prev) => {
      const next = [
        ...prev,
        {
          id: ++turnSeq,
          role: "user" as const,
          text,
          order: maxOrderRef.current + 0.5,
          optimistic: true,
        },
      ]
      next.sort((a, b) => a.order - b.order || a.id - b.id)
      return next
    })
  }, [])

  // Latest audio getters kept in a ref so the waveform's rAF loop stays
  // stable (it reads output while the agent speaks, mic input otherwise).
  const vizRef = useRef<{
    out: () => Uint8Array
    inp: () => Uint8Array
    speaking: boolean
  } | null>(null)
  vizRef.current = {
    out: conv.getOutputByteFrequencyData,
    inp: conv.getInputByteFrequencyData,
    speaking: conv.isSpeaking,
  }
  const getViz = useCallback((): Uint8Array | null => {
    const v = vizRef.current
    if (!v) return null
    try {
      return v.speaking ? v.out() : v.inp()
    } catch {
      return null
    }
  }, [])

  // Auto-scroll the transcript as it grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [turns])

  const startVoice = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true
    setError(null)
    setMode("voice")
    setUiState("connecting")
    try {
      const res = await fetch("/api/voice/token")
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(b.error || `Could not start (${res.status})`)
      }
      const { token } = (await res.json()) as { token: string }
      await conv.startSession({
        conversationToken: token,
        connectionType: "webrtc",
      })
    } catch (e) {
      startedRef.current = false
      setError(e instanceof Error ? e.message : "Could not start the call.")
      setUiState("failed")
    }
  }, [conv])

  const startTextThenSend = useCallback(
    async (text: string) => {
      startedRef.current = true
      setError(null)
      setMode("text")
      setUiState("connecting")
      try {
        const res = await fetch("/api/voice/signed-url")
        if (!res.ok) {
          const b = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(b.error || `Could not start (${res.status})`)
        }
        const { signedUrl } = (await res.json()) as { signedUrl: string }
        await conv.startSession({
          signedUrl,
          connectionType: "websocket",
          textOnly: true,
        })
        addTypedTurn(text)
        conv.sendUserMessage(text)
      } catch (e) {
        startedRef.current = false
        setError(e instanceof Error ? e.message : "Could not start the chat.")
        setUiState("failed")
      }
    },
    [conv, addTypedTurn]
  )

  const submitDraft = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    setDraft("")
    if (uiState === "live") {
      addTypedTurn(text)
      conv.sendUserMessage(text)
    } else if (uiState === "idle" || uiState === "failed") {
      void startTextThenSend(text)
    }
  }, [draft, uiState, conv, startTextThenSend, addTypedTurn])

  const endCall = useCallback(() => {
    conv.endSession()
    startedRef.current = false
    setUiState("idle")
    setMode(null)
  }, [conv])

  const reset = useCallback(() => {
    if (startedRef.current) conv.endSession()
    startedRef.current = false
    setTurns([])
    setDraft("")
    setError(null)
    setUiState("idle")
    setMode(null)
  }, [conv])

  useEffect(() => {
    return () => {
      if (startedRef.current) conv.endSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connecting = uiState === "connecting"
  const live = uiState === "live"
  const failed = uiState === "failed"
  const voiceLive = live && mode === "voice"
  const isSpeaking = conv.isSpeaking
  const hasTurns = turns.length > 0

  const statusLine = connecting
    ? "Connecting…"
    : voiceLive
      ? isSpeaking
        ? "Catalyst is speaking…"
        : "Listening — speak or type"
      : live
        ? "Connected — type your message"
        : failed
          ? "Couldn't connect"
          : "Talk or type to Catalyst"

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header / controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              live
                ? "bg-accent animate-pulse"
                : connecting
                  ? "bg-amber-400 animate-pulse"
                  : failed
                    ? "bg-red-500"
                    : "bg-white/25"
            )}
          />
          <span
            className={cn(
              "font-medium",
              live ? "text-accent" : failed ? "text-red-300" : "text-muted"
            )}
            aria-live="polite"
          >
            {statusLine}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {live && (
            <button
              type="button"
              onClick={endCall}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-red-500/60 hover:text-red-400"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              End
            </button>
          )}
          {hasTurns && !live && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:border-accent/50 hover:text-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New conversation
            </button>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4"
      >
        {!hasTurns ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <button
              type="button"
              onClick={live ? endCall : startVoice}
              disabled={connecting}
              aria-label="Start voice call"
              className={cn(
                "group relative flex h-20 w-20 items-center justify-center rounded-full border transition-colors",
                "border-white/15 bg-white/[0.03] hover:border-accent/50",
                connecting && "cursor-wait opacity-80"
              )}
            >
              {connecting ? (
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
              ) : (
                <Mic className="h-7 w-7 text-foreground transition-colors group-hover:text-accent" />
              )}
            </button>
            <p className="max-w-xs text-sm text-muted">
              Tap to talk, or type below — Catalyst can brief you on the work
              and take your details.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {turns.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                    t.role === "user"
                      ? "self-end bg-accent/15 text-foreground"
                      : "self-start border border-white/10 bg-white/[0.03] text-muted"
                  )}
                >
                  {t.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {voiceLive && (
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <Waveform getData={getViz} active={voiceLive} />
        </div>
      )}

      {/* Input bar */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={live ? endCall : startVoice}
          disabled={connecting}
          aria-label={voiceLive ? "End voice call" : "Start voice call"}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
            voiceLive
              ? "border-accent/60 bg-accent/10 text-accent"
              : "border-white/15 bg-white/[0.03] text-foreground hover:border-accent/50",
            connecting && "cursor-wait opacity-80"
          )}
        >
          {connecting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submitDraft()
            }
          }}
          placeholder={
            voiceLive ? "Speak, or type a message…" : "Send a message to start…"
          }
          className="h-11 flex-1 rounded-full border border-white/15 bg-white/[0.03] px-4 text-sm text-foreground placeholder:text-muted/60 outline-none focus:border-accent/50"
        />
        <button
          type="button"
          onClick={submitDraft}
          disabled={!draft.trim() || connecting}
          aria-label="Send message"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
            draft.trim() && !connecting
              ? "border-accent/60 bg-accent/10 text-accent hover:bg-accent/20"
              : "border-white/10 bg-white/[0.02] text-muted/50"
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

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
// Homepage launcher — opens the single sitewide assistant (the corner widget)
// in the chosen mode. The actual conversation lives in one place.
// ---------------------------------------------------------------------------

function openAssistant(mode: "voice" | "text") {
  window.dispatchEvent(
    new CustomEvent("supercore:assistant", { detail: { mode } })
  )
}

export function VoiceAssistantSection() {
  return (
    <section
      id="assistant"
      className="scroll-mt-28 border-y border-white/5 bg-[#0a0a0a] py-16 md:py-20"
    >
      <div className="mx-auto max-w-2xl px-4 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
          Talk to my assistant
        </p>
        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          Ask Catalyst about my work — by voice or text.
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Catalyst briefs you on my projects and takes down your details if
          you&apos;d like a follow-up. Voice and text run on one shared brain
          behind a custom-LLM gateway. This page is the demo: it&apos;s the
          kind of assistant I build for clients.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openAssistant("voice")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-black transition-transform hover:scale-[1.03]"
          >
            <Mic className="h-4 w-4" />
            Talk to Catalyst
          </button>
          <button
            type="button"
            onClick={() => openAssistant("text")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-bold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
          >
            <MessageSquare className="h-4 w-4" />
            Type instead
          </button>
        </div>

        <p className="mt-4 text-xs text-muted/60">
          Opens the assistant. Voice uses your microphone — live demo, please
          keep it brief.
        </p>
      </div>
    </section>
  )
}
