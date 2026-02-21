"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Radio, ChevronUp, ChevronDown, X, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getAblyClient, disconnectAbly, BROADCAST_CHANNEL } from "@/lib/ably"
import {
  ChatMessage,
  BroadcastMessage,
  TurnStartPayload,
  ChunkPayload,
  TurnEndPayload,
  TopicPayload,
  CachedShowData,
  CACHE_KEY,
  CACHE_EXPIRY_MS,
  SPEAKER_CONFIG,
  Speaker
} from "@/types/broadcast"
import type { RealtimeChannel } from "ably"

type ViewState = "expanded" | "minimized" | "hidden"

// How long before we consider the broadcast "idle" (no new messages)
const BROADCAST_IDLE_TIMEOUT_MS = 30_000 // 30 seconds

// Resize constraints
const MIN_HEIGHT = 150
const MAX_HEIGHT = 500
const DEFAULT_HEIGHT = 200

export function LiveShowPiP() {
  const [viewState, setViewState] = useState<ViewState>("minimized")
  const [isLive, setIsLive] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isReplay, setIsReplay] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const [isIdle, setIsIdle] = useState(false) // Broadcast connected but no recent activity
  const [currentTopic, setCurrentTopic] = useState<string>("")
  const [expandedHeight, setExpandedHeight] = useState(DEFAULT_HEIGHT)
  const [isDragging, setIsDragging] = useState(false)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const liveCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load cached data from localStorage
  const loadCachedData = useCallback((): CachedShowData | null => {
    if (typeof window === "undefined") return null
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const data: CachedShowData = JSON.parse(cached)
      const isExpired = Date.now() - data.cachedAt > CACHE_EXPIRY_MS
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }
      
      return data
    } catch {
      return null
    }
  }, [])

  // Save messages to cache
  const saveToCache = useCallback((msgs: ChatMessage[]) => {
    if (typeof window === "undefined" || msgs.length === 0) return
    try {
      const data: CachedShowData = {
        messages: msgs.slice(-10), // Keep last 10 messages
        cachedAt: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Reset idle timer - called whenever we receive a broadcast
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false)
    
    // Clear existing idle timeout
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }
    
    // Set new idle timeout
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true)
    }, BROADCAST_IDLE_TIMEOUT_MS)
  }, [])

  // Handle broadcast messages
  const handleBroadcast = useCallback((message: BroadcastMessage) => {
    setIsLive(true)
    setIsReplay(false)
    resetIdleTimer()

    // Clear the "not live" timeout since we got a message
    if (liveCheckTimeoutRef.current) {
      clearTimeout(liveCheckTimeoutRef.current)
      liveCheckTimeoutRef.current = null
    }

    switch (message.type) {
      case "turn_start": {
        const payload = message.payload as TurnStartPayload
        setMessages(prev => {
          // Don't add duplicate messages
          if (prev.some(m => m.id === payload.message.id)) return prev
          // Merge the speaker from payload into the message
          const messageWithSpeaker = {
            ...payload.message,
            speaker: payload.speaker
          }
          const updated = [...prev, messageWithSpeaker].slice(-5)
          return updated
        })
        break
      }
      case "chunk": {
        const payload = message.payload as ChunkPayload
        setMessages(prev =>
          prev.map(m =>
            m.id === payload.messageId
              ? { ...m, content: payload.content }
              : m
          )
        )
        break
      }
      case "turn_end": {
        const payload = message.payload as TurnEndPayload
        setMessages(prev => {
          const updated = prev.map(m =>
            m.id === payload.messageId
              ? { ...m, content: payload.finalContent }
              : m
          )
          saveToCache(updated)
          return updated
        })
        break
      }
      case "full_state": {
        // Handle full state sync if needed
        break
      }
      case "topic_state": {
        const payload = message.payload as TopicPayload
        if (payload.topic) {
          setCurrentTopic(payload.topic)
        }
        break
      }
    }
  }, [saveToCache])

  // Connect to Ably
  useEffect(() => {
    if (viewState === "hidden") {
      disconnectAbly()
      return
    }

    setConnectionStatus("connecting")
    
    const client = getAblyClient()
    const channel = client.channels.get(BROADCAST_CHANNEL)
    channelRef.current = channel

    channel.subscribe("broadcast", (msg) => {
      handleBroadcast(msg.data as BroadcastMessage)
    })

    client.connection.on("connected", () => {
      setConnectionStatus("connected")
      
      // Set a timeout - if no messages after 5s, show cached replay
      liveCheckTimeoutRef.current = setTimeout(() => {
        const cached = loadCachedData()
        if (cached && cached.messages.length > 0) {
          setMessages(cached.messages)
          setIsReplay(true)
          setIsLive(false)
        }
      }, 5000)
    })

    client.connection.on("disconnected", () => {
      setConnectionStatus("disconnected")
      setIsLive(false)
    })

    return () => {
      if (liveCheckTimeoutRef.current) {
        clearTimeout(liveCheckTimeoutRef.current)
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current)
      }
      channel.unsubscribe()
      // Disconnect Ably on unmount to prevent connection leak
      disconnectAbly()
    }
  }, [viewState, handleBroadcast, loadCachedData])

  // Auto-scroll to bottom
  useEffect(() => {
    if (viewState === "expanded" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, viewState])

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const startY = e.clientY
    const startHeight = expandedHeight
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + deltaY))
      setExpandedHeight(newHeight)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [expandedHeight])

  // Get the latest message for display
  const latestMessage = messages[messages.length - 1]

  // Hidden state - nothing rendered
  if (viewState === "hidden") {
    return null
  }

  // Minimized state - thin bottom bar with larger touch targets for mobile
  if (viewState === "minimized") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setViewState("expanded")}
            className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 py-4 sm:py-3 -my-1 active:bg-white/5 transition-colors rounded-lg"
          >
            {isLive && !isIdle ? (
              <span className="relative flex h-3 w-3 sm:h-2 sm:w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-2 sm:w-2 bg-red-500"></span>
              </span>
            ) : isLive && isIdle ? (
              <span className="relative flex h-3 w-3 sm:h-2 sm:w-2 flex-shrink-0">
                <span className="relative inline-flex rounded-full h-3 w-3 sm:h-2 sm:w-2 bg-amber-500"></span>
              </span>
            ) : (
              <Radio className="w-4 h-4 sm:w-3 sm:h-3 text-lime-400/50 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-xs text-white/50 flex-shrink-0">The Supercore Show</span>
            <span className="text-sm sm:text-xs text-white/25 flex-shrink-0 hidden sm:inline">—</span>
            {currentTopic ? (
              <span className="text-sm sm:text-xs text-lime-400/70 truncate min-w-0 hidden sm:inline">{currentTopic}</span>
            ) : (
              <span className="text-sm sm:text-xs text-white/30 italic flex-shrink-0 hidden sm:inline">AI guests debate live</span>
            )}
            <ChevronUp className="w-5 h-5 sm:w-4 sm:h-4 text-white/30 group-hover:text-lime-400 group-active:text-lime-400 transition-colors flex-shrink-0 ml-auto sm:ml-0" />
          </button>
          <button
            onClick={() => setViewState("hidden")}
            className="p-3 sm:p-1 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors flex-shrink-0"
            aria-label="Hide"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4 text-white/30 hover:text-white/70" />
          </button>
        </div>
      </div>
    )
  }

  // Expanded state - full-width bottom bar
  return (
    <div 
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-md border-t border-white/10 shadow-2xl shadow-black/50"
    >
      {/* Resize handle */}
      <div 
        onMouseDown={handleMouseDown}
        className={`absolute top-0 left-0 right-0 h-2 cursor-ns-resize flex items-center justify-center group hover:bg-white/5 transition-colors ${isDragging ? 'bg-lime-400/10' : ''}`}
      >
        <div className={`w-12 h-1 rounded-full transition-colors ${isDragging ? 'bg-lime-400/50' : 'bg-white/20 group-hover:bg-white/40'}`} />
      </div>
      
      <div className="max-w-7xl mx-auto pt-2">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {isLive && !isIdle ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
              </div>
            ) : isLive && isIdle ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-medium text-amber-400">PAUSED</span>
                <span className="text-xs text-white/40">— waiting for next segment</span>
              </div>
            ) : isReplay ? (
              <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-lime-400" />
                <span className="text-xs font-medium text-white/70">REPLAY</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/50">
                  {connectionStatus === "connecting" ? "Connecting..." : "Waiting for show..."}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/50">The Supercore Show</span>
              <span className="text-xs text-white/25">—</span>
              <span className="text-xs text-white/30 italic">AI guests debate live</span>
            </div>
            {currentTopic && (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-white/10 min-w-0 flex-1">
                <span className="text-[10px] text-white/30 uppercase tracking-wide flex-shrink-0">Topic:</span>
                <span className="text-xs text-lime-400/80 truncate min-w-0">{currentTopic}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="https://show.per4ex.org/live"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 transition-colors"
            >
              <span>Full experience</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setViewState("minimized")}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Minimize"
            >
              <ChevronDown className="w-4 h-4 text-white/50 hover:text-white" />
            </button>
            <button
              onClick={() => setViewState("hidden")}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white/50 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div 
          className="px-6 py-4 overflow-y-auto"
          style={{ maxHeight: `${expandedHeight}px` }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <p className="text-sm text-white/50 mb-2">
                {isReplay ? "No replay available" : "🎙️ The show is warming up..."}
              </p>
              <p className="text-xs text-white/30">
                {isReplay 
                  ? "Check back later for new content" 
                  : "AI guests will debate live topics here. Stay tuned!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isLatest={msg.id === latestMessage?.id} isIdle={isIdle} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, isLatest, isIdle }: { message: ChatMessage; isLatest?: boolean; isIdle?: boolean }) {
  const speaker = message.speaker || "host"
  const config = SPEAKER_CONFIG[speaker as Speaker] || SPEAKER_CONFIG.host

  // Show typing indicator only if: is latest message, no content yet, and broadcast is active (not idle)
  const showTyping = isLatest && !message.content && !isIdle

  return (
    <div className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isLatest ? 'opacity-100' : 'opacity-70'}`}>
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base border-2"
        style={{ 
          backgroundColor: `${config.color}33`,
          borderColor: `${config.color}66`
        }}
      >
        {config.avatar}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span 
            className="text-sm font-bold"
            style={{ color: config.color }}
          >
            {config.name}
          </span>
          {showTyping && (
            <span className="text-xs text-white/40">speaking...</span>
          )}
        </div>
        {message.content ? (
          <div className="text-sm text-white/90 leading-relaxed prose prose-invert prose-sm max-w-none 
            prose-p:my-1 prose-p:leading-relaxed
            prose-strong:text-white prose-strong:font-semibold
            prose-em:text-white/80
            prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
            prose-ol:my-1 prose-ol:pl-4
            prose-headings:text-white prose-headings:font-bold prose-headings:my-2
            prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
            prose-code:text-lime-400 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-white/5 prose-pre:p-2 prose-pre:rounded prose-pre:my-2
            prose-a:text-lime-400 prose-a:no-underline hover:prose-a:underline
          ">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : showTyping ? (
          <span className="inline-flex gap-1.5 items-center h-5">
            <span className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '300ms' }} />
          </span>
        ) : (
          <span className="text-sm text-white/40 italic">Message not received</span>
        )}
      </div>
    </div>
  )
}
