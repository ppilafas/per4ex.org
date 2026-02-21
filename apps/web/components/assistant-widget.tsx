"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  MessageSquare, X, Send, Loader2, Sparkles, Minimize2,
  Mic, MicOff, Radio, AlertCircle, Phone, PhoneOff, Clock, ChevronDown, ChevronUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { Conversation, TextConversation } from "@elevenlabs/client"
import type { IncomingSocketEvent } from "@elevenlabs/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Mode = "chat" | "voice"
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface Message {
  role: "user" | "assistant"
  content: string
  source?: "chat" | "voice"
}

interface ProjectContext {
  solutionId: string
  solutionTitle: string
  problem: string
  stack: string[]
}

const STARTERS = [
  "I have a project idea",
  "What can you build for me?",
  "Show me your recent work",
  "What's your availability?",
]

const MESSAGE_LIMIT = 15
const VOICE_SILENCE_TIMEOUT_MS = 45_000  // auto-end after 45s no speech
const VOICE_MAX_DURATION_MS = 5 * 60_000 // hard cap 5 minutes per call
const VOICE_MAX_CALLS_PER_SESSION = 3     // max calls before lockout

// ---------------------------------------------------------------------------
// Unified Assistant Widget
// ---------------------------------------------------------------------------
export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("chat")

  // --- Chat state ---
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "System online. How can I assist you?", source: "chat" },
  ])
  const [input, setInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null)
  const projectContextRef = useRef<ProjectContext | null>(null)
  const messagesRef = useRef<Message[]>(messages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textConvRef = useRef<TextConversation | null>(null)
  const isTextConnectingRef = useRef(false)

  // --- Voice state ---
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [isMicMuted, setIsMicMuted] = useState(true)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState("")
  const [callCount, setCallCount] = useState(0)
  const [callDurationSec, setCallDurationSec] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(20).fill(3))
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const conversationRef = useRef<Conversation | null>(null)
  const isConnectingRef = useRef(false)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callDurationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callStartTimeRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const waveformRafRef = useRef<number | null>(null)
  const agentSpeakingAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasSpokenRef = useRef(false)
  const connectionStatusRef = useRef<ConnectionStatus>("disconnected")

  // keep refs in sync
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { projectContextRef.current = projectContext }, [projectContext])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  // Client tool implementations for ElevenLabs
  // These are passed to the Conversation via clientTools config
  const clientTools = {
    send_email: async (params: {
      user_name: string;
      user_email: string;
      subject: string;
      message: string;
    }) => {
      console.log("🔧 [send_email] Executing with params:", params)
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params.user_name,
            email: params.user_email,
            subject: params.subject,
            message: params.message,
            source: "voice_agent",
          }),
        })

        if (!response.ok) throw new Error("Email API failed")

        console.log("✅ [send_email] Success")
        return "Email sent successfully. I've forwarded your message to Panagiotis."
      } catch (error) {
        console.error("❌ [send_email] Error:", error)
        return "I encountered an error sending the email. Please try again or contact directly at contact@supercore.tech"
      }
    },

    schedule_meeting: async (params: {
      user_email: string;
      preferred_date: string;
      topic: string;
      duration?: string;
    }) => {
      console.log("🔧 [schedule_meeting] Executing with params:", params)
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Meeting Request",
            email: params.user_email,
            subject: `Meeting Request: ${params.topic}`,
            message: `Preferred time: ${params.preferred_date}\nTopic: ${params.topic}\nDuration: ${params.duration || "Not specified"}`,
            source: "voice_agent_meeting",
          }),
        })

        if (!response.ok) throw new Error("Meeting API failed")

        console.log("✅ [schedule_meeting] Success")
        return "Meeting request sent! Panagiotis will reach out to confirm the time."
      } catch (error) {
        console.error("❌ [schedule_meeting] Error:", error)
        return "I had trouble scheduling the meeting. Please email contact@supercore.tech directly."
      }
    },
  }

  // Restore call count from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("voice-call-count")
    if (stored) setCallCount(parseInt(stored, 10))
  }, [])
  useEffect(() => { sessionStorage.setItem("voice-call-count", callCount.toString()) }, [callCount])

  // Message count persistence
  useEffect(() => {
    const stored = sessionStorage.getItem("catalyst-chat-count")
    if (stored) {
      const n = parseInt(stored, 10)
      setMessageCount(n)
      if (process.env.NODE_ENV !== "development" && n >= MESSAGE_LIMIT) setIsLimitReached(true)
    }
  }, [])
  useEffect(() => { sessionStorage.setItem("catalyst-chat-count", messageCount.toString()) }, [messageCount])

  // ---------------------------------------------------------------------------
  // Text chat via ElevenLabs TextConversation
  // ---------------------------------------------------------------------------
  const connectTextChat = useCallback(async () => {
    if (textConvRef.current || isTextConnectingRef.current) return
    isTextConnectingRef.current = true
    setIsChatLoading(true)
    try {
      const res = await fetch("/api/voice/session", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to get session")
      const { signedUrl } = await res.json() as { signedUrl: string }

      const tc = await TextConversation.startSession({
        signedUrl,
        clientTools,
        onConnect: () => {
          console.log("✅ [TextConversation] connected")
          fetch("/api/voice/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "connect" }) }).catch(() => {})
          setIsChatLoading(false)
        },
        onDisconnect: () => {
          console.log("⚠️ [TextConversation] disconnected")
          fetch("/api/voice/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "disconnect" }) }).catch(() => {})
          textConvRef.current = null
        },
        onError: (err: unknown) => {
          console.error("❌ [TextConversation] error:", err)
          fetch("/api/voice/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "error", data: { message: String(err) } }) }).catch(() => {})
          setIsChatLoading(false)
        },
        onMessage: (message: IncomingSocketEvent | string) => {
          const map = message as unknown as { type?: string; text?: string; message?: string; transcript?: string }
          const msgType = typeof message === "object" ? map.type : ""
          const text = typeof message === "string" ? message : (map.message || map.text || map.transcript)
          console.log("📩 [TextConversation] type=", msgType, "text=", text?.slice(0, 60))

          // TextConversation SDK sends agent replies with type=undefined and text populated
          // Voice sends type="agent_response" — accept both
          const isAgentReply = msgType === "agent_response" || (!msgType && typeof text === "string" && text.trim())
          if (isAgentReply && typeof text === "string" && text.trim()) {
            fetch("/api/voice/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "receive", data: { text } }) }).catch(() => {})
            setIsChatLoading(false)
            setMessages(prev => {
              const last = prev[prev.length - 1]
              if (last?.role === "assistant" && last.source === "chat" && !last.content) {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "assistant", content: text, source: "chat" }
                return updated
              }
              return [...prev, { role: "assistant", content: text, source: "chat" }]
            })
            setMessageCount(prev => prev + 1)
          }
        },
      })
      textConvRef.current = tc
    } catch (err) {
      console.error("❌ [TextConversation] connect failed:", err)
      setIsChatLoading(false)
    } finally {
      isTextConnectingRef.current = false
    }
  }, [])

  const disconnectTextChat = useCallback(async () => {
    try { await textConvRef.current?.endSession?.() } catch { /* ignore */ }
    textConvRef.current = null
  }, [])

  // Connect text chat when widget opens in chat mode; disconnect on close/mode switch
  useEffect(() => {
    if (isOpen && mode === "chat") {
      connectTextChat()
    } else {
      disconnectTextChat()
    }
  }, [isOpen, mode, connectTextChat, disconnectTextChat])

  // ---------------------------------------------------------------------------
  // Waveform animation
  // ---------------------------------------------------------------------------
  const startMicWaveform = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const ctx = new AudioContext()
      audioContextRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const bars = Array.from({ length: 20 }, (_, i) => {
          const val = data[Math.floor(i * data.length / 20)] || 0
          return Math.max(3, Math.round((val / 255) * 48))
        })
        setWaveformBars(bars)
        waveformRafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch { /* mic permission denied — fall back to idle bars */ }
  }, [])

  const stopMicWaveform = useCallback(() => {
    if (waveformRafRef.current) { cancelAnimationFrame(waveformRafRef.current); waveformRafRef.current = null }
    if (agentSpeakingAnimRef.current) { clearInterval(agentSpeakingAnimRef.current); agentSpeakingAnimRef.current = null }
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    micStreamRef.current = null
    audioContextRef.current?.close().catch(() => {})
    audioContextRef.current = null
    analyserRef.current = null
    setWaveformBars(Array(20).fill(3))
    setAgentSpeaking(false)
  }, [])

  const startAgentWaveform = useCallback(() => {
    // When agent speaks, mic analyser may be quiet — animate synthetically
    setAgentSpeaking(true)
    if (agentSpeakingAnimRef.current) clearInterval(agentSpeakingAnimRef.current)
    agentSpeakingAnimRef.current = setInterval(() => {
      setWaveformBars(Array.from({ length: 20 }, () => Math.max(4, Math.floor(Math.random() * 40))))
    }, 80)
  }, [])

  const stopAgentWaveform = useCallback(() => {
    setAgentSpeaking(false)
    if (agentSpeakingAnimRef.current) { clearInterval(agentSpeakingAnimRef.current); agentSpeakingAnimRef.current = null }
  }, [])

  // ---------------------------------------------------------------------------
  // Voice timers
  // ---------------------------------------------------------------------------
  const clearVoiceTimers = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    if (maxDurationTimerRef.current) { clearTimeout(maxDurationTimerRef.current); maxDurationTimerRef.current = null }
    if (callDurationIntervalRef.current) { clearInterval(callDurationIntervalRef.current); callDurationIntervalRef.current = null }
  }, [])

  const resetSilenceTimer = useCallback((endCall: () => void) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = setTimeout(() => {
      endCall()
      setVoiceError("Call ended — no speech detected for 45 seconds.")
    }, VOICE_SILENCE_TIMEOUT_MS)
  }, [])

  // ---------------------------------------------------------------------------
  // Voice connect / disconnect
  // ---------------------------------------------------------------------------
  const disconnectVoice = useCallback(async () => {
    // Don't interrupt an in-progress connect, and don't double-disconnect
    if (connectionStatusRef.current === "disconnected" || isConnectingRef.current) {
      console.log("🛡️ [disconnectVoice] GUARDED — status=", connectionStatusRef.current, "connecting=", isConnectingRef.current)
      return
    }
    console.trace("🔴 [disconnectVoice] CALLED FROM")
    clearVoiceTimers()
    stopMicWaveform()
    setCallDurationSec(0)
    connectionStatusRef.current = "disconnected"
    setConnectionStatus("disconnected")
    setIsMicMuted(true)
    try { conversationRef.current?.setMicMuted?.(true) } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 150))
    try { await conversationRef.current?.endSession?.() } catch { /* ignore */ }
    finally { conversationRef.current = null }
  }, [clearVoiceTimers, stopMicWaveform])

  const connectVoice = useCallback(async () => {
    // Guard against React StrictMode double-invokes and re-entrancy
    if (conversationRef.current || isConnectingRef.current) {
      console.log("🛡️ [connectVoice] GUARDED — existing conversation or connecting")
      return
    }
    if (callCount >= VOICE_MAX_CALLS_PER_SESSION) {
      setVoiceError(`Call limit reached (${VOICE_MAX_CALLS_PER_SESSION} calls per session). Refresh the page to continue.`)
      return
    }
    isConnectingRef.current = true
    connectionStatusRef.current = "connecting"
    setConnectionStatus("connecting")
    setVoiceError(null)
    setTranscript("")
    setCallDurationSec(0)

    try {
      const res = await fetch("/api/voice/session", { cache: "no-store" })
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p.error || "Failed to initialize voice session")
      }
      const { signedUrl } = await res.json() as { signedUrl: string }
      if (!signedUrl) throw new Error("Missing signed URL")

      const doDisconnect = async () => {
        if (connectionStatusRef.current === "disconnected") {
          console.log("🛡️ [doDisconnect] GUARDED — already disconnected")
          return
        }
        console.trace("🔴 [doDisconnect] CALLED FROM")
        clearVoiceTimers()
        stopMicWaveform()
        setCallDurationSec(0)
        connectionStatusRef.current = "disconnected"
        setConnectionStatus("disconnected")
        setIsMicMuted(true)
        try { conversationRef.current?.setMicMuted?.(true) } catch { /* ignore */ }
        await new Promise(r => setTimeout(r, 150))
        try { await conversationRef.current?.endSession?.() } catch { /* ignore */ }
        conversationRef.current = null
      }

      const conversation = await Conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        clientTools,
        onConnect: () => {
          console.log("✅ [onConnect] ElevenLabs websocket connected")
          connectionStatusRef.current = "connected"
          setConnectionStatus("connected")
          setIsMicMuted(false)
          setCallCount(prev => prev + 1)
          hasSpokenRef.current = false
          callStartTimeRef.current = Date.now()
          startMicWaveform()
          callDurationIntervalRef.current = setInterval(() => {
            setCallDurationSec(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
          }, 1000)
          maxDurationTimerRef.current = setTimeout(() => {
            doDisconnect()
            setVoiceError("Call ended — maximum call duration (5 min) reached.")
          }, VOICE_MAX_DURATION_MS)
          // Silence timer starts only after user first speaks — not on connect
        },
        onDisconnect: () => {
          console.log("⚠️ [onDisconnect] ElevenLabs websocket disconnected")
          clearVoiceTimers()
          stopMicWaveform()
          setCallDurationSec(0)
          connectionStatusRef.current = "disconnected"
          setConnectionStatus("disconnected")
          setIsMicMuted(true)
          conversationRef.current = null
        },
        onError: (err: unknown) => {
          console.error("❌ [onError] ElevenLabs error:", err)
          setVoiceError("Voice connection error")
          setConnectionStatus("error")
        },
        onMessage: async (message: IncomingSocketEvent | string) => {
          console.log("📩 [onMessage] Raw:", typeof message === "string" ? message : JSON.stringify(message).slice(0, 200))
          const map = message as unknown as { 
            message?: string; 
            text?: string; 
            transcript?: string; 
            type?: string;
          }
          const text = typeof message === "string" ? message : (map.message || map.text || map.transcript)
          const msgType = typeof message === "object" ? map.type : ""
          console.log("📩 [onMessage] Parsed: type=", msgType, "text=", text?.slice(0, 50))
          
          // Detect agent speaking vs user speaking for waveform style
          if (msgType === "agent_response" || msgType === "audio") {
            startAgentWaveform()
          } else if (msgType === "user_transcript") {
            stopAgentWaveform()
          }
          if (typeof text === "string" && text.trim()) {
            setTranscript(text)
            // Only start/reset silence timer after user has spoken at least once
            if (msgType === "user_transcript" || msgType === "user_audio") {
              hasSpokenRef.current = true
            }
            if (hasSpokenRef.current) {
              resetSilenceTimer(doDisconnect)
            }
            setMessages(prev => {
              const last = prev[prev.length - 1]
              if (last?.source === "voice" && last.role === "assistant") {
                const updated = [...prev]
                updated[updated.length - 1] = { ...last, content: text }
                return updated
              }
              return [...prev, { role: "assistant", content: text, source: "voice" }]
            })
          }
        },
      })
      conversationRef.current = conversation
    } catch (err) {
      connectionStatusRef.current = "error"
      setConnectionStatus("error")
      setVoiceError(err instanceof Error ? err.message : "Failed to connect")
      clearVoiceTimers()
    } finally {
      isConnectingRef.current = false
    }
  }, [callCount, clearVoiceTimers, resetSilenceTimer, startMicWaveform, stopMicWaveform, startAgentWaveform, stopAgentWaveform])

  // Disconnect voice when closing widget or switching to chat
  useEffect(() => {
    if (!isOpen || mode === "chat") {
      disconnectVoice()
    }
  }, [isOpen, mode, disconnectVoice])

  // Cleanup on unmount
  useEffect(() => () => { disconnectVoice(); disconnectTextChat(); stopMicWaveform() }, [disconnectVoice, disconnectTextChat, stopMicWaveform])

  // ---------------------------------------------------------------------------
  // Chat send — via ElevenLabs TextConversation
  // ---------------------------------------------------------------------------
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isChatLoading || isLimitReached) return
    if (process.env.NODE_ENV !== "development" && messageCount >= MESSAGE_LIMIT) { setIsLimitReached(true); return }

    const userMsg: Message = { role: "user", content: text, source: "chat" }
    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "", source: "chat" }])
    setIsChatLoading(true)

    // Ensure TextConversation is connected before sending
    if (!textConvRef.current) {
      await connectTextChat()
    }

    try {
      fetch("/api/voice/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "send", data: { text } }) }).catch(() => {})
      textConvRef.current?.sendUserMessage(text)
    } catch (err) {
      console.error("❌ [handleSendMessage] failed:", err)
      setMessages(prev => { const a = [...prev]; a[a.length - 1] = { role: "assistant", content: "Error: Unable to send message.", source: "chat" }; return a })
      setIsChatLoading(false)
    }
  }, [isChatLoading, isLimitReached, messageCount, connectTextChat])

  // External events (open-chat, start-project) — placed after handleSendMessage so it's in scope
  useEffect(() => {
    const handleOpenChat = () => { setIsOpen(true); setMode("chat") }

    const handleStartProject = (e: CustomEvent<ProjectContext>) => {
      const context = e.detail
      setProjectContext(context)
      projectContextRef.current = context
      setIsOpen(true)
      setMode("chat")
      const initial: Message[] = [{ role: "assistant", content: "System online. How can I assist you?", source: "chat" }]
      setMessages(initial)
      messagesRef.current = initial
      setMessageCount(0)
      setIsLimitReached(false)
      const projectMessage = `I'm interested in the "${context.solutionTitle}" solution. I'd like to discuss a project.`
      setTimeout(() => handleSendMessage(projectMessage), 800)
    }

    window.addEventListener("open-chat", handleOpenChat)
    window.addEventListener("start-project", handleStartProject as EventListener)
    return () => {
      window.removeEventListener("open-chat", handleOpenChat)
      window.removeEventListener("start-project", handleStartProject as EventListener)
    }
  }, [handleSendMessage])

  const handleOpen = () => {
    setIsOpen(true)
    setMessageCount(0)
    setIsLimitReached(false)
    sessionStorage.removeItem("catalyst-chat-count")
  }

  const toggleMic = () => {
    if (!conversationRef.current) return
    const next = !isMicMuted
    setIsMicMuted(next)
    try { conversationRef.current.setMicMuted?.(next) } catch { /* ignore */ }
  }

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0")
    const s = (sec % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const callsRemaining = VOICE_MAX_CALLS_PER_SESSION - callCount
  const isCallLimitReached = callCount >= VOICE_MAX_CALLS_PER_SESSION

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Single floating button */}
      <button
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-accent to-accent/90 text-black rounded-2xl shadow-2xl hover:shadow-accent/30 hover:scale-110 transition-all duration-300 z-50 border border-black/20 hover:border-black/30"
        aria-label="Toggle assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[380px] h-[560px] bg-gradient-to-br from-background/98 via-background/96 to-background/90 backdrop-blur-2xl border border-card-border/60 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-card-border/40 bg-gradient-to-r from-card/30 via-card/20 to-card/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/40 shadow-lg overflow-hidden">
                      <img src="/catalyst3d.png" alt="Assistant" className="w-7 h-7 object-contain" />
                    </div>
                    <div className={cn(
                      "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background",
                      mode === "voice" && connectionStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-green-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm tracking-tight">AI Assistant</h3>
                    <p className="text-xs text-muted/70">
                      {mode === "voice"
                        ? connectionStatus === "connected" ? "Voice connected" : connectionStatus
                        : "System online"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-card/50 transition-colors group">
                  <Minimize2 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                </button>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-card/40 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setMode("chat")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    mode === "chat"
                      ? "bg-accent text-black shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>
                <button
                  onClick={() => setMode("voice")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    mode === "voice"
                      ? "bg-accent text-black shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Voice
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Shared message history */}
              {messages.map((msg, idx) => {
                if (!msg.content) return null
                return (
                  <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-accent to-accent/90 text-black rounded-tr-md"
                        : "bg-gradient-to-br from-card via-card/80 to-card/60 border border-card-border/60 text-foreground rounded-tl-md"
                    )}>
                      {msg.source === "voice" && msg.role === "assistant" && (
                        <div className="flex items-center gap-1 mb-1.5 opacity-60">
                          <Radio className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-wider">Voice</span>
                        </div>
                      )}
                      {msg.role === "user" ? (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-strong:text-white prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5 prose-code:text-accent prose-code:bg-black/30 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-a:text-accent prose-headings:text-white prose-headings:font-bold prose-headings:my-2 prose-h3:text-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Chat: conversation starters */}
              {mode === "chat" && messages.length === 1 && (
                <div className="mt-2">
                  <div className="bg-gradient-to-r from-card/30 via-card/20 to-card/30 rounded-2xl p-3 border border-card-border/40">
                    <p className="text-xs text-foreground/70 font-medium mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" /> Suggested
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {STARTERS.map((s, i) => (
                        <button key={i} onClick={() => handleSendMessage(s)}
                          className="text-left text-xs p-2.5 rounded-xl border border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-foreground/80 hover:text-accent transition-all duration-200">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat: loading */}
              {mode === "chat" && isChatLoading && !messages[messages.length - 1]?.content && (
                <div className="flex justify-start">
                  <div className="bg-card border border-card-border/60 p-3 rounded-2xl rounded-tl-md shadow-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span className="text-xs text-muted">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice: idle state */}
              {mode === "voice" && connectionStatus === "disconnected" && !voiceError && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Phone className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Start a voice call</p>
                    <p className="text-xs text-muted/60 mt-1">Speak naturally — Kai responds in real time</p>
                  </div>
                  {callsRemaining < VOICE_MAX_CALLS_PER_SESSION && (
                    <p className="text-[10px] text-muted/40">{callsRemaining} call{callsRemaining !== 1 ? "s" : ""} remaining this session</p>
                  )}
                </div>
              )}

              {/* Voice: connecting */}
              {mode === "voice" && connectionStatus === "connecting" && (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  </div>
                  <p className="text-sm text-muted/70">Connecting…</p>
                </div>
              )}

              {/* Voice: connected — waveform */}
              {mode === "voice" && connectionStatus === "connected" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  {/* Waveform */}
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="flex items-end justify-center gap-[3px] h-16 px-4">
                      {waveformBars.map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className={cn(
                            "w-[5px] rounded-full transition-all duration-75",
                            agentSpeaking ? "bg-accent" : "bg-accent/60"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted/60">
                      {agentSpeaking ? "Kai is speaking…" : "Listening…"}
                    </p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-1.5 text-xs text-muted/50">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(callDurationSec)}</span>
                    <span className="text-muted/30">/ 5:00 max</span>
                  </div>

                  {/* Transcript toggle */}
                  <button
                    onClick={() => setShowTranscript(v => !v)}
                    className="flex items-center gap-1 text-[10px] text-muted/50 hover:text-muted transition-colors"
                  >
                    {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showTranscript ? "Hide transcript" : "Show transcript"}
                  </button>

                  {/* Transcript (hidden by default) */}
                  {showTranscript && (
                    <div className="w-full bg-card/30 border border-card-border/50 rounded-xl p-3">
                      <p className="text-xs text-foreground/70 leading-relaxed">{transcript || "Waiting for speech…"}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Voice: error state */}
              {mode === "voice" && voiceError && (
                <div className="mt-2">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-red-300">{voiceError}</span>
                  </div>
                  {!isCallLimitReached && (
                    <button onClick={() => setVoiceError(null)}
                      className="mt-2 w-full text-xs text-accent/70 hover:text-accent transition-colors">
                      Try again
                    </button>
                  )}
                </div>
              )}

              {/* Limit reached */}
              {isLimitReached && process.env.NODE_ENV !== "development" && (
                <div className="flex justify-center">
                  <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 text-center max-w-[90%]">
                    <div className="text-accent font-bold mb-2">💫 Session Complete</div>
                    <p className="text-muted text-xs">You've reached the {MESSAGE_LIMIT}-message limit. Close and reopen to start fresh.</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-card-border/40 bg-gradient-to-r from-card/20 via-card/10 to-card/20 backdrop-blur-sm">
              {mode === "chat" ? (
                <form onSubmit={e => { e.preventDefault(); handleSendMessage(input); setInput("") }} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={isLimitReached ? "Session limit reached" : "Type a message…"}
                    disabled={isLimitReached}
                    className="flex-1 bg-background/80 border border-card-border/60 rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !input.trim() || isLimitReached}
                    className="p-2.5 bg-accent/20 hover:bg-accent/40 disabled:bg-card-border/40 text-accent disabled:text-muted rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex gap-2">
                  {connectionStatus === "connecting" ? (
                    <button disabled className="flex-1 h-11 rounded-xl bg-card text-muted flex items-center justify-center gap-2 text-sm opacity-60 cursor-not-allowed">
                      <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
                    </button>
                  ) : connectionStatus === "connected" ? (
                    <>
                      <button
                        onClick={toggleMic}
                        className={cn(
                          "flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
                          isMicMuted
                            ? "bg-card border border-card-border text-foreground hover:bg-card/70"
                            : "bg-accent text-black"
                        )}
                      >
                        {isMicMuted ? <><MicOff className="w-4 h-4" /> Unmute</> : <><Mic className="w-4 h-4" /> Mute</>}
                      </button>
                      <button
                        onClick={disconnectVoice}
                        className="px-4 h-11 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm transition-all flex items-center gap-1.5"
                      >
                        <PhoneOff className="w-4 h-4" /> End
                      </button>
                    </>
                  ) : isCallLimitReached ? (
                    <div className="flex-1 h-11 rounded-xl bg-card/50 border border-card-border text-muted text-xs flex items-center justify-center text-center px-3">
                      Call limit reached — refresh to reset
                    </div>
                  ) : (
                    <button
                      onClick={connectVoice}
                      className="flex-1 h-11 rounded-xl bg-accent text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                    >
                      <Phone className="w-4 h-4" /> Start Call
                    </button>
                  )}
                </div>
              )}

              {mode === "chat" && !isLimitReached && process.env.NODE_ENV !== "development" && messageCount > 0 && (
                <p className="text-center text-[10px] text-muted/50 mt-2">{messageCount}/{MESSAGE_LIMIT} messages</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
