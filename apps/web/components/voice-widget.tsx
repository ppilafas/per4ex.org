"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, MicOff, Volume2, X, Radio, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface VoiceWidgetProps {
  wsUrl?: string
  apiKey?: string
  tenantId?: string
}

export function VoiceWidget({ 
  wsUrl = process.env.NEXT_PUBLIC_CATALYST_WS_URL || "wss://api.catalyst.example.com/ws/voice",
  apiKey,
  tenantId = "catalyst-widget"
}: VoiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0) // For visual feedback

  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioQueueRef = useRef<Float32Array[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  // Audio configuration for PCM16
  const SAMPLE_RATE = 24000 // 24kHz as per Catalyst spec
  const CHANNELS = 1 // Mono
  const BIT_DEPTH = 16

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    setConnectionStatus("connecting")
    setError(null)

    try {
      // Construct WebSocket URL with auth if needed
      const url = new URL(wsUrl)
      if (apiKey) {
        url.searchParams.set("api_key", apiKey)
      }
      url.searchParams.set("tenant_id", tenantId)
      url.searchParams.set("mode", "realtime")
      url.searchParams.set("sample_rate", SAMPLE_RATE.toString())
      url.searchParams.set("format", "pcm16")

      const ws = new WebSocket(url.toString())
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connected")
        setConnectionStatus("connected")
        setError(null)
        
        // Send session initialization if needed
        if (sessionIdRef.current) {
          ws.send(JSON.stringify({
            type: "session.resume",
            session_id: sessionIdRef.current
          }))
        } else {
          ws.send(JSON.stringify({
            type: "session.create",
            config: {
              namespace: "per4ex-kb"
            }
          }))
        }
      }

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          // Binary audio data (PCM16)
          handleAudioResponse(event.data)
        } else {
          // JSON message
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e)
          }
        }
      }

      ws.onerror = (err) => {
        console.error("WebSocket error:", err)
        setConnectionStatus("error")
        setError("Connection error. Check console for details.")
      }

      ws.onclose = () => {
        console.log("WebSocket closed")
        setConnectionStatus("disconnected")
        if (isRecording) {
          stopRecording()
        }
      }
    } catch (err: any) {
      console.error("Failed to connect:", err)
      setConnectionStatus("error")
      setError(err.message || "Failed to connect to Catalyst")
    }
  }, [wsUrl, apiKey, tenantId, isRecording])

  // Handle WebSocket JSON messages
  const handleWebSocketMessage = (data: any) => {
    if (data.type === "session.created" || data.type === "session.resumed") {
      sessionIdRef.current = data.session_id
      console.log("Session ID:", data.session_id)
    } else if (data.type === "error") {
      setError(data.message || "Unknown error")
    } else if (data.type === "transcript") {
      // Could display transcripts if needed
      console.log("Transcript:", data.text)
    }
  }

  // Handle incoming audio response
  const handleAudioResponse = async (audioBlob: Blob) => {
    try {
      // Convert PCM16 blob to playable audio
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioContext = audioContextRef.current || new AudioContext({ sampleRate: SAMPLE_RATE })
      if (!audioContextRef.current) {
        audioContextRef.current = audioContext
      }

      // Decode PCM16 to AudioBuffer
      const audioBuffer = await decodePCM16(arrayBuffer, audioContext)
      
      // Play audio
      await playAudioBuffer(audioBuffer, audioContext)
    } catch (err) {
      console.error("Failed to play audio response:", err)
    }
  }

  // Decode PCM16 binary data to AudioBuffer
  const decodePCM16 = async (arrayBuffer: ArrayBuffer, audioContext: AudioContext): Promise<AudioBuffer> => {
    const dataView = new DataView(arrayBuffer)
    const length = arrayBuffer.byteLength / 2 // 16-bit = 2 bytes per sample
    const audioBuffer = audioContext.createBuffer(CHANNELS, length, SAMPLE_RATE)
    const channelData = audioBuffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      // Read 16-bit signed integer (little-endian)
      const sample = dataView.getInt16(i * 2, true)
      // Normalize to -1.0 to 1.0
      channelData[i] = sample / 32768.0
    }

    return audioBuffer
  }

  // Play AudioBuffer
  const playAudioBuffer = async (audioBuffer: AudioBuffer, audioContext: AudioContext) => {
    setIsPlaying(true)
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)

    source.onended = () => {
      setIsPlaying(false)
    }

    source.start(0)
  }

  // Initialize audio recording
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: CHANNELS,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      mediaStreamRef.current = stream

      // Create AudioContext
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
      audioContextRef.current = audioContext

      // Create analyser for visual feedback
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // For PCM16 conversion, we'll use a ScriptProcessorNode or AudioWorklet
      // For simplicity, using ScriptProcessorNode (deprecated but widely supported)
      const bufferSize = 4096
      const processor = audioContext.createScriptProcessor(bufferSize, CHANNELS, CHANNELS)
      
      processor.onaudioprocess = (e) => {
        if (!isRecording || wsRef.current?.readyState !== WebSocket.OPEN) return

        const inputData = e.inputBuffer.getChannelData(0)
        const pcm16 = convertFloat32ToPCM16(inputData)
        
        // Send audio chunk to WebSocket
        wsRef.current?.send(pcm16)
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      // Start audio level monitoring
      startAudioLevelMonitoring()

      return true
    } catch (err: any) {
      console.error("Failed to initialize audio:", err)
      setError(err.message || "Failed to access microphone")
      return false
    }
  }

  // Convert Float32Array to PCM16 ArrayBuffer
  const convertFloat32ToPCM16 = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2)
    const view = new DataView(buffer)

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1] and convert to 16-bit integer
      const sample = Math.max(-1, Math.min(1, float32Array[i]))
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(i * 2, int16, true) // little-endian
    }

    return buffer
  }

  // Monitor audio levels for visual feedback
  const startAudioLevelMonitoring = () => {
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) {
        setAudioLevel(0)
        return
      }

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255) // Normalize to 0-1

      animationFrameRef.current = requestAnimationFrame(updateLevel)
    }
    updateLevel()
  }

  // Start recording
  const startRecording = async () => {
    if (connectionStatus !== "connected") {
      await connectWebSocket()
      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setError("WebSocket not connected")
      return
    }

    const audioInitialized = await initializeAudio()
    if (!audioInitialized) return

    setIsRecording(true)
    setError(null)

    // Send start recording message
    wsRef.current.send(JSON.stringify({
      type: "input_audio_buffer.append",
      audio: "" // Empty to start streaming
    }))
  }

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false)
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Send stop message
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "input_audio_buffer.commit"
      }))
    }

    setAudioLevel(0)
  }

  // Disconnect WebSocket
  const disconnect = () => {
    stopRecording()
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnectionStatus("disconnected")
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Auto-connect when widget opens
  useEffect(() => {
    if (isOpen && connectionStatus === "disconnected") {
      connectWebSocket()
    }
  }, [isOpen, connectionStatus, connectWebSocket])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "bg-green-500"
      case "connecting": return "bg-yellow-500"
      case "error": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected": return "Connected"
      case "connecting": return "Connecting..."
      case "error": return "Error"
      default: return "Disconnected"
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-24 md:right-32 p-4 bg-accent text-black rounded-full shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all duration-300 z-50 border border-black/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Voice Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] bg-background/95 backdrop-blur-xl border border-card-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-card-border bg-card/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                  <Radio className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Voice Mode</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <span className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(), 
                      connectionStatus === "connected" && "animate-pulse")}></span>
                    {getStatusText()}
                  </p>
                </div>
              </div>
              {connectionStatus === "connected" && (
                <button
                  onClick={disconnect}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              {/* Error Display */}
              {error && (
                <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Connection Status */}
              {connectionStatus === "disconnected" && (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-card border-2 border-card-border flex items-center justify-center mx-auto">
                    <Radio className="w-10 h-10 text-muted" />
                  </div>
                  <div>
                    <p className="text-muted text-sm mb-2">Ready to connect</p>
                    <button
                      onClick={connectWebSocket}
                      className="px-4 py-2 bg-accent text-black rounded-full text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      Connect to Catalyst
                    </button>
                  </div>
                </div>
              )}

              {connectionStatus === "connecting" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
                  <p className="text-muted text-sm">Connecting to Catalyst...</p>
                </div>
              )}

              {/* Recording Interface */}
              {connectionStatus === "connected" && (
                <div className="w-full space-y-6">
                  {/* Audio Visualizer */}
                  <div className="relative w-full h-32 bg-card border border-card-border rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isRecording ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-sm text-muted font-mono">RECORDING</span>
                        </div>
                      ) : isPlaying ? (
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-accent animate-pulse" />
                          <span className="text-sm text-muted font-mono">PLAYING</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted font-mono">IDLE</span>
                      )}
                    </div>
                    
                    {/* Audio Level Bars */}
                    {isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                        {Array.from({ length: 20 }).map((_, i) => {
                          const barHeight = audioLevel * 100 * (1 - Math.abs(i - 10) / 10)
                          return (
                            <div
                              key={i}
                              className="w-2 bg-accent rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(4, barHeight)}%` }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Control Button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={connectionStatus !== "connected"}
                    className={cn(
                      "w-full h-20 rounded-full flex items-center justify-center gap-3 text-lg font-medium transition-all duration-300",
                      isRecording
                        ? "bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30"
                        : "bg-accent text-black hover:bg-accent/90 shadow-lg hover:shadow-accent/20"
                    )}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-6 h-6" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>

                  {/* Instructions */}
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted">
                      {isRecording 
                        ? "Speak now. Catalyst is listening in real-time."
                        : "Click to start a voice conversation with Catalyst AI"}
                    </p>
                    <p className="text-xs text-muted/60 font-mono">
                      Realtime Mode • PCM16 • 24kHz
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

