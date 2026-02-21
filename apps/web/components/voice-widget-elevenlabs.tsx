"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, MicOff, X, Loader2, Radio, Minimize2, AlertCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Conversation } from "@elevenlabs/client"
import type { IncomingSocketEvent } from "@elevenlabs/client"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

type WidgetKind = "chat" | "voice"

function useWidgetState(widgetType: WidgetKind) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false

    const stored = localStorage.getItem("supercore-widget-state")
    if (!stored) return false

    try {
      const state = JSON.parse(stored) as Record<string, boolean>
      return Boolean(state[widgetType])
    } catch {
      return false
    }
  })

  const setWidgetOpen = (open: boolean) => {
    const currentState = JSON.parse(localStorage.getItem("supercore-widget-state") || "{}")
    const newState = { ...currentState }

    if (open) {
      newState.chat = widgetType === "chat"
      newState.voice = widgetType === "voice"
    } else {
      newState[widgetType] = false
    }

    localStorage.setItem("supercore-widget-state", JSON.stringify(newState))
    window.dispatchEvent(new CustomEvent("widgetStateChange", { detail: newState }))
    setIsOpen(newState[widgetType])
  }

  return [isOpen, setWidgetOpen] as const
}

interface VoiceWidgetElevenLabsProps {
  agentId?: string
}

export function VoiceWidgetElevenLabs({ agentId }: VoiceWidgetElevenLabsProps) {
  const [isOpen, setIsOpen] = useWidgetState("voice")
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [isMicMuted, setIsMicMuted] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>("")

  const conversationRef = useRef<Conversation | null>(null)
  const isConnectingRef = useRef(false)
  const isCatalystPage = typeof window !== "undefined" && window.location.pathname === "/catalyst-ai"

  const connect = useCallback(async () => {
    if (conversationRef.current || isConnectingRef.current) return
    isConnectingRef.current = true

    setConnectionStatus("connecting")
    setError(null)

    try {
      const bootstrap = await fetch("/api/voice/session", { cache: "no-store" })
      if (!bootstrap.ok) {
        const payload = await bootstrap.json().catch(() => ({}))
        throw new Error(payload.error || "Failed to initialize ElevenLabs session")
      }

      const data = (await bootstrap.json()) as { signedUrl?: string; agentId?: string }
      const signedUrl = data.signedUrl as string
      const resolvedAgentId = agentId || data.agentId

      if (!signedUrl) {
        throw new Error("Missing signed URL from ElevenLabs session bootstrap")
      }

      if (!resolvedAgentId) {
        throw new Error("Missing ElevenLabs agent ID")
      }

      const conversation = await Conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        onConnect: () => {
          setConnectionStatus("connected")
          setIsMicMuted(false)
        },
        onDisconnect: () => {
          setConnectionStatus("disconnected")
          setIsMicMuted(true)
          conversationRef.current = null
        },
        onError: (event: unknown) => {
          console.error("ElevenLabs voice error:", event)
          setError("ElevenLabs conversation error")
          setConnectionStatus("error")
        },
        onMessage: (message: IncomingSocketEvent | string) => {
          if (typeof message === "string") {
            setTranscript(message)
            return
          }

          const messageMap = message as unknown as {
            message?: string
            text?: string
            transcript?: string
          }
          const maybeText = messageMap.message || messageMap.text || messageMap.transcript
          if (typeof maybeText === "string") {
            setTranscript(maybeText)
          }
        },
      })

      conversationRef.current = conversation
      setConnectionStatus("connected")
      setIsMicMuted(false)
    } catch (err: unknown) {
      setConnectionStatus("error")
      setError(err instanceof Error ? err.message : "Failed to connect to ElevenLabs")
    } finally {
      isConnectingRef.current = false
    }
  }, [agentId])

  const disconnect = useCallback(async () => {
    try {
      await conversationRef.current?.endSession?.()
    } catch (error) {
      console.error("Failed to end ElevenLabs session:", error)
    } finally {
      conversationRef.current = null
      setConnectionStatus("disconnected")
      setIsMicMuted(true)
    }
  }, [])

  const toggleMic = async () => {
    if (!conversationRef.current) return

    const nextMuted = !isMicMuted
    setIsMicMuted(nextMuted)
    try {
      conversationRef.current.setMicMuted?.(nextMuted)
    } catch (error) {
      console.error("Failed toggling ElevenLabs microphone:", error)
      setError("Could not toggle microphone")
    }
  }

  useEffect(() => {
    if (!isOpen) {
      disconnect()
      return
    }

    if (connectionStatus === "disconnected") {
      connect()
    }
  }, [connect, connectionStatus, disconnect, isOpen])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 md:right-32 p-4 bg-accent text-black rounded-full shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all duration-300 z-50 border border-black/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed w-[380px] h-[520px] bg-gradient-to-br from-background/98 via-background/96 to-background/90 backdrop-blur-2xl border border-card-border/60 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden",
              isCatalystPage ? "top-24 right-6" : "bottom-24 right-6"
            )}
          >
            <div className="p-5 border-b border-card-border/40 bg-gradient-to-r from-card/30 via-card/20 to-card/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/40 shadow-lg">
                    <Radio className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base tracking-tight">ElevenLabs Voice</h3>
                    <p className="text-xs text-muted/80 font-medium">{connectionStatus}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-card/50 transition-colors group"
                  title="Close Voice Chat"
                >
                  <Minimize2 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between gap-4">
              {error && (
                <div className="w-full bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-sm shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-medium">Voice error</p>
                    <p className="text-red-300/80 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="bg-card/30 border border-card-border/50 rounded-2xl p-4 min-h-[160px]">
                <p className="text-xs uppercase tracking-wider text-muted/70 mb-2">Live transcript</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{transcript || "Transcript will appear here."}</p>
              </div>

              <div className="space-y-3">
                {connectionStatus === "connecting" ? (
                  <button className="w-full h-16 rounded-2xl bg-card text-muted flex items-center justify-center gap-3" disabled>
                    <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
                  </button>
                ) : connectionStatus === "connected" ? (
                  <button
                    onClick={toggleMic}
                    className={cn(
                      "w-full h-20 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3",
                      isMicMuted
                        ? "bg-gradient-to-r from-card to-card/70 border border-card-border text-foreground"
                        : "bg-gradient-to-r from-accent via-accent to-accent/90 text-black"
                    )}
                  >
                    {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    {isMicMuted ? "Unmute Mic" : "Mute Mic"}
                  </button>
                ) : (
                  <button
                    onClick={connect}
                    className="w-full h-16 rounded-2xl bg-gradient-to-r from-accent via-accent to-accent/90 text-black font-semibold"
                  >
                    Connect to ElevenLabs
                  </button>
                )}

                {connectionStatus === "connected" && (
                  <button
                    onClick={disconnect}
                    className="w-full h-11 rounded-xl border border-card-border text-muted hover:text-foreground hover:bg-card/30"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
