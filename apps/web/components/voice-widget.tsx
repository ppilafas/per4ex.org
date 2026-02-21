"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Mic, MicOff, Volume2, X, Radio, Loader2, AlertCircle, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Custom hook to coordinate widget states
function useWidgetState(widgetType: 'chat' | 'voice') {
  const [isOpen, setIsOpen] = useState(false)

  // Load initial state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('supercore-widget-state')
    if (stored) {
      const state = JSON.parse(stored)
      setIsOpen(state[widgetType] || false)
    }
  }, [widgetType])

  // Update localStorage when state changes
  const setWidgetOpen = (open: boolean) => {
    const currentState = JSON.parse(localStorage.getItem('supercore-widget-state') || '{}')
    const newState = { ...currentState }

    // If opening this widget, close the other one
    if (open) {
      newState.chat = widgetType === 'chat' ? true : false
      newState.voice = widgetType === 'voice' ? true : false
    } else {
      newState[widgetType] = false
    }

    localStorage.setItem('supercore-widget-state', JSON.stringify(newState))

    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('widgetStateChange', { detail: newState }))

    // Update both widgets' states
    setIsOpen(newState[widgetType])
  }

  return [isOpen, setWidgetOpen] as const
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

interface VoiceWidgetProps {
  wsUrl?: string
  tenantId?: string
}

export function VoiceWidget({ 
  wsUrl = process.env.NEXT_PUBLIC_CATALYST_WS_URL || "wss://catalyst-service.fly.dev:8765",
  tenantId = process.env.CATALYST_TENANT_ID || "anonymous"
}: VoiceWidgetProps) {
  const [isOpen, setIsOpen] = useWidgetState('voice')

  // Widget only opens when user clicks the button

  // Check if we're on the catalyst page for positioning
  const isCatalystPage = typeof window !== 'undefined' && window.location.pathname === '/catalyst-ai'
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0) // For visual feedback
  const isRecordingRef = useRef(false) // Synchronous ref for onaudioprocess
  const audioBufferRef = useRef(new Float32Array(0)) // Buffer to accumulate audio samples
  const recordingStartTimeRef = useRef<number | null>(null) // Track recording duration
 // Track button press state

  const wsRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null)
  const audioQueueRef = useRef<AudioBuffer[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const isPlayingRef = useRef(false)
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      // Construct WebSocket URL
      const url = new URL(wsUrl)
      url.searchParams.set("tenant_id", tenantId)
      url.searchParams.set("mode", "realtime")
      url.searchParams.set("sample_rate", SAMPLE_RATE.toString())
      url.searchParams.set("format", "pcm16")

      const ws = new WebSocket(url.toString())
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connected to:", url.toString())
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
              namespace: "supercore-kb"
            }
          }))
        }
      }

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          // Binary audio data (PCM16)
          handleAudioResponse(event.data)
        } else {
        // JSON message - handle Catalyst API format
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
                setError("Voice mode not available in production. WebSocket connection failed.")
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
  }, [wsUrl, tenantId, isRecording])

  // Handle WebSocket JSON messages (Catalyst API format)
  const handleWebSocketMessage = (data: any) => {
    console.log("Received WebSocket message:", data)

    if (data.type === "audio_transcript") {
      // Handle transcript messages
      console.log("Transcript:", data.content || data.text)
    } else if (data.type === "audio_chunk") {
      // Handle incoming audio data
      if (data.data) {
        // Convert base64 to blob and play
        const audioData = atob(data.data)
        const arrayBuffer = new ArrayBuffer(audioData.length)
        const view = new Uint8Array(arrayBuffer)
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i)
        }
        const audioBlob = new Blob([arrayBuffer], { type: 'audio/pcm' })
        handleAudioResponse(audioBlob)
      }
    } else if (data.type === "audio_stream_start") {
      console.log("Audio stream started")
      setIsPlaying(true)
    } else if (data.type === "audio_stream_end") {
      console.log("Audio stream ended")
      setIsPlaying(false)
    } else if (data.type === "audio_mode") {
      console.log("Audio mode:", data.realtime ? "realtime" : "chained")
    } else if (data.type === "error") {
      setError(data.message || "Voice processing error")
    } else if (data.session_id) {
      // Handle session creation
      sessionIdRef.current = data.session_id
      console.log("Session ID:", data.session_id)
    }
  }

  // Handle incoming audio response - queue instead of playing immediately
  const handleAudioResponse = async (audioBlob: Blob) => {
    try {
      // Convert PCM16 blob to playable audio
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioContext = audioContextRef.current || new AudioContext({ sampleRate: SAMPLE_RATE })
      if (!audioContextRef.current) {
        audioContextRef.current = audioContext
      }

      // Decode PCM16 to AudioBuffer
      const decodedAudioBuffer = await decodePCM16(arrayBuffer, audioContext)
      
      // Queue audio for sequential playback
      audioQueueRef.current.push(decodedAudioBuffer)
      console.log(`🎵 Queued audio chunk: ${audioQueueRef.current.length} in queue`)

      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playQueuedAudio()
      }
    } catch (err) {
      console.error("Failed to queue audio response:", err)
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

  // Play all queued audio chunks seamlessly (no gaps/jitter)
  const playQueuedAudio = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      setIsPlaying(false)
      console.log("🎵 Audio queue empty, playback stopped")
      return
    }

    isPlayingRef.current = true
    setIsPlaying(true)

    // Concatenate all queued chunks into one seamless buffer
    const totalLength = audioQueueRef.current.reduce((sum, buffer) => sum + buffer.length, 0)
    const sampleRate = audioQueueRef.current[0].sampleRate
    const numberOfChannels = audioQueueRef.current[0].numberOfChannels

    const combinedBuffer = audioContextRef.current!.createBuffer(numberOfChannels, totalLength, sampleRate)

    let offset = 0
    for (const chunk of audioQueueRef.current) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = combinedBuffer.getChannelData(channel)
        const chunkData = chunk.getChannelData(channel)
        channelData.set(chunkData, offset)
      }
      offset += chunk.length
    }

    // Clear the queue since we're playing everything at once
    const chunksPlayed = audioQueueRef.current.length
    audioQueueRef.current = []

    console.log(`🎵 Playing ${chunksPlayed} chunks seamlessly (${combinedBuffer.duration.toFixed(2)}s total)`)

    const source = audioContextRef.current!.createBufferSource()
    source.buffer = combinedBuffer
    source.connect(audioContextRef.current!.destination)

    source.onended = () => {
      isPlayingRef.current = false
      setIsPlaying(false)
      console.log("🎵 Seamless playback completed")
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

      // Ensure audio context is started (required in some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
        console.log("🎵 AudioContext resumed from suspended state")
      }

      // Create analyser for visual feedback
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // For PCM16 conversion, we'll use a ScriptProcessorNode or AudioWorklet
      // For simplicity, using ScriptProcessorNode (deprecated but widely supported)
      // Reduced buffer size for Fly.io WebSocket limits (4096 → 2048 = ~5.5KB chunks)
      const bufferSize = 2048
      const processor = audioContext.createScriptProcessor(bufferSize, CHANNELS, CHANNELS)
      
      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) {
          // Silently skip when not recording (prevents console spam)
          return
        }

        const inputData = e.inputBuffer.getChannelData(0)
        console.log(`🎤 onaudioprocess: received ${inputData.length} samples, first few values: ${Array.from(inputData.slice(0, 5)).map(v => v.toFixed(4)).join(', ')}`)

        // PTT Mode: Just accumulate audio, don't send during recording
        const newBuffer = new Float32Array(audioBufferRef.current.length + inputData.length)
        newBuffer.set(audioBufferRef.current)
        newBuffer.set(inputData, audioBufferRef.current.length)
        audioBufferRef.current = newBuffer

        const bufferedMs = (audioBufferRef.current.length / SAMPLE_RATE) * 1000
        console.log(`🎵 PTT Mode - Buffered audio: ${audioBufferRef.current.length} samples (${bufferedMs.toFixed(1)}ms)`)
      }

      // CRITICAL: Connect the processor to the audio graph for onaudioprocess to fire
      source.connect(processor)
      processor.connect(audioContext.destination)

      console.log("🎵 Audio graph connected - ScriptProcessorNode should now receive audio")

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
    console.log("🎵 Starting audio level monitoring...")
    const updateLevel = () => {
      if (!analyserRef.current || !isRecordingRef.current) {
        console.log("🎵 Stopping audio level monitoring - analyser:", !!analyserRef.current, "recording:", isRecordingRef.current)
        setAudioLevel(0)
        return
      }

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      // Calculate average level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const normalizedLevel = average / 255 // Normalize to 0-1
      setAudioLevel(normalizedLevel)

      // Only log significant audio levels to reduce console spam
      if (normalizedLevel > 0.01) {
        console.log("🎵 Audio level:", normalizedLevel.toFixed(3))
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel)
    }
    updateLevel()
  }

  // Start recording (PTT)
  const startRecording = async (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault() // Prevent any default behavior
    if (isRecording) return // Already recording

    console.log("🎤 PTT: Starting recording, current connectionStatus:", connectionStatus)

    // Clear any previous errors
    setError(null)

    // Track recording start time
    recordingStartTimeRef.current = Date.now()

    // Set recording state immediately for responsive feedback
    setIsRecording(true)
    isRecordingRef.current = true
    console.log("🎤 PTT: Recording state set to true")

    // Clear any leftover audio buffers from previous sessions
    audioBufferRef.current = new Float32Array(0)
    audioQueueRef.current = []

    // Auto-stop after 30 seconds to prevent extremely long recordings
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current)
    }
    autoStopTimeoutRef.current = setTimeout(() => {
      if (isRecordingRef.current) {
        console.log("🎤 Auto-stopping recording after 30 seconds maximum duration")
        stopRecording()
      }
    }, 30000)

    if (connectionStatus === "disconnected") {
      setConnectionStatus("connecting")
      await connectWebSocket()
      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else if (connectionStatus === "connecting") {
      // Already connecting, just wait a bit
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.log("🎤 PTT: WebSocket not ready, readyState:", wsRef.current?.readyState)
      setError("Failed to connect to voice service. Voice mode may not be available in production.")
      // Reset recording state on error
      setIsRecording(false)
      isRecordingRef.current = false
      return
    }

    console.log("🎤 PTT: WebSocket ready, proceeding with recording setup")

    console.log("🎤 PTT: Initializing audio...")
    const audioInitialized = await initializeAudio()
    console.log("🎤 PTT: Audio initialization result:", audioInitialized)

    if (!audioInitialized) {
      console.log("🎤 PTT: Audio initialization failed")
      // Reset recording state on error
      setIsRecording(false)
      isRecordingRef.current = false
      return
    }

    console.log("🎤 PTT: Audio initialized successfully")

            // Send start recording message (Catalyst API format)
            const startMessage = {
              type: "transcribe_audio",
              audio_data: "", // Empty to start streaming
              format: "pcm16",
              sample_rate: SAMPLE_RATE
            }
            console.log("🎤 PTT: Sending start message:", startMessage)
            wsRef.current.send(JSON.stringify(startMessage))
            console.log("🎤 PTT: Start message sent successfully")

            // Start audio level monitoring now that we're recording
            startAudioLevelMonitoring()
            console.log("🎵 Started audio level monitoring")
  }

  // Stop recording (PTT)
  const stopRecording = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault() // Prevent any default behavior
    if (!isRecording) return // Not recording

    // Check for minimum recording duration (500ms) to ensure we have audio data
    const recordingDuration = recordingStartTimeRef.current
      ? Date.now() - recordingStartTimeRef.current
      : 0

    if (recordingDuration < 500) {
      console.log(`🎤 Recording too short, canceling (${recordingDuration}ms)`)
      // Cancel recording if too short
      isRecordingRef.current = false
      setIsRecording(false)
      audioBufferRef.current = new Float32Array(0)
      recordingStartTimeRef.current = null
      setError("Recording too short - please hold the button for at least 500ms")

      // Stop audio monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      setAudioLevel(0)
      return
    }

    if (recordingDuration > 30000) { // 30 seconds
      console.log("🎤 Auto-stopping recording after 30 seconds")
    }
    setIsRecording(false)
    isRecordingRef.current = false // Synchronous ref update

    console.log(`🎤 PTT: Stopping recording, duration: ${recordingDuration}ms`)

    // Send any remaining buffered audio before stopping
    console.log(`🎤 Stop recording: audioBufferRef length = ${audioBufferRef.current.length}`)
    if (audioBufferRef.current.length > 100 && wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`🎤 Sending final buffered audio: ${audioBufferRef.current.length} samples`)
      const pcm16 = convertFloat32ToPCM16(audioBufferRef.current)
      const uint8Array = new Uint8Array(pcm16)
      console.log(`🎤 PCM16 buffer size: ${pcm16.byteLength} bytes, Uint8Array length: ${uint8Array.length}`)
      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
      const base64Data = btoa(binaryString)
      console.log(`🎤 Base64 data length: ${base64Data.length} characters, first 100 chars: ${base64Data.substring(0, 100)}`)

      const message = {
        type: "transcribe_audio",
        audio_data: base64Data,
        format: "pcm16",
        sample_rate: SAMPLE_RATE
      }
      console.log(`🎤 Sending message:`, JSON.stringify(message).substring(0, 200) + '...')
      wsRef.current.send(JSON.stringify(message))
      console.log(`🎤 Message sent successfully`)
    } else {
      console.log(`🎤 Not sending audio: buffer length ${audioBufferRef.current.length} (need > 100), ws readyState: ${wsRef.current?.readyState}`)
    }

    // Clear audio buffers
    audioBufferRef.current = new Float32Array(0)
    audioQueueRef.current = [] // Clear any queued audio
    
    // Stop audio level monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    setAudioLevel(0)

    // Send stop message (Catalyst API format)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "transcribe_audio",
        audio_data: "", // Empty to signal end
        format: "pcm16",
        voice_mode: true,
        use_realtime: true,
        sample_rate: SAMPLE_RATE,
        end_of_stream: true,
        config: {
          llm_profile: "voice_ops"
        }
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
      // Clear auto-stop timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current)
      }
    }
  }, [])

  // Auto-connect when widget opens
  useEffect(() => {
    if (isOpen && connectionStatus === "disconnected") {
      console.log("Attempting to connect voice widget to:", wsUrl)
      connectWebSocket()
    }
  }, [isOpen, connectionStatus, connectWebSocket, wsUrl])

  // Clean up any pending timeouts

  // Listen for widget state changes from other widgets
  useEffect(() => {
    const handleStateChange = (state: any) => {
      const newIsOpen = state.voice || false
      if (newIsOpen !== isOpen) {
        // If another widget opened, close this one
        if (newIsOpen && !state.voice) {
          setIsOpen(false)
        }
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supercore-widget-state') {
        const state = JSON.parse(e.newValue || '{}')
        handleStateChange(state)
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      handleStateChange(e.detail)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('widgetStateChange', handleCustomEvent as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('widgetStateChange', handleCustomEvent as EventListener)
    }
  }, [isOpen])

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
            className={cn(
              "fixed w-[380px] h-[520px] bg-gradient-to-br from-background/98 via-background/96 to-background/90 backdrop-blur-2xl border border-card-border/60 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden",
              isCatalystPage ? "top-24 right-6" : "bottom-24 right-6"
            )}
          >
            {/* Header */}
            <div className="p-5 border-b border-card-border/40 bg-gradient-to-r from-card/30 via-card/20 to-card/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/40 shadow-lg">
                      <Radio className="w-5 h-5 text-accent" />
                    </div>
                    {connectionStatus === "connected" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-pulse"></div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-base tracking-tight">Catalyst Voice</h3>
                    <p className="text-xs text-muted/80 font-medium">
                    {getStatusText()}
                  </p>
                </div>
              </div>
                <div className="flex items-center gap-2">
              {connectionStatus === "connected" && (
                <button
                  onClick={disconnect}
                      className="px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-card/50 rounded-lg transition-all duration-200"
                >
                  Disconnect
                </button>
              )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-card/50 transition-colors group"
                    title="Close Voice Chat"
                  >
                    <Minimize2 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              {/* Error Display */}
              {error && (
                <div className="w-full bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 text-sm shadow-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-medium">Connection Error</p>
                    <p className="text-red-300/80 text-xs mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Connection Status */}
              {connectionStatus === "disconnected" && (
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-card-border/60 flex items-center justify-center mx-auto shadow-lg">
                      <Radio className="w-12 h-12 text-muted" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-card-border/40 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-foreground">Ready to Connect</h4>
                    <p className="text-muted text-sm max-w-xs mx-auto">Start a real-time voice conversation with Catalyst AI</p>
                    <button
                      onClick={connectWebSocket}
                      className="px-6 py-3 bg-gradient-to-r from-accent to-accent/90 text-black rounded-xl text-sm font-semibold hover:from-accent/90 hover:to-accent/80 transition-all duration-300 shadow-lg hover:shadow-accent/20 hover:scale-105"
                    >
                      Connect to Catalyst
                    </button>
                  </div>
                </div>
              )}

              {connectionStatus === "connecting" && (
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/40 flex items-center justify-center mx-auto shadow-lg">
                      <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-accent/40 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-foreground">Connecting...</h4>
                    <p className="text-muted text-sm">Establishing secure voice connection</p>
                  </div>
                </div>
              )}

              {/* Recording Interface */}
              {connectionStatus === "connected" && (
                <div className="w-full space-y-6">
                  {/* Audio Visualizer */}
                  <div className="relative w-full h-36 bg-gradient-to-br from-card via-card/80 to-card/60 border border-card-border/60 rounded-2xl overflow-hidden shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isRecording ? (
                        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></div>
                          <span className="text-sm text-white font-mono font-medium">
                            RECORDING {audioBufferRef.current.length > 0 ? `(${Math.floor(audioBufferRef.current.length / SAMPLE_RATE * 1000)}ms)` : ''}
                            {recordingStartTimeRef.current && (Date.now() - recordingStartTimeRef.current) > 25000 && (
                              <span className="text-yellow-400 ml-2 animate-pulse">⚠️</span>
                            )}
                          </span>
                        </div>
                      ) : isPlaying ? (
                        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                          <Volume2 className="w-5 h-5 text-accent animate-pulse" />
                          <span className="text-sm text-white font-mono font-medium">
                            PLAYING {audioQueueRef.current.length > 0 ? `(${audioQueueRef.current.length} queued)` : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/5">
                          <span className="text-xs text-muted font-mono font-medium tracking-wider">IDLE</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Audio Level Bars */}
                    {isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center gap-1 px-6">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const barHeight = Math.max(8, audioLevel * 100 * (1 - Math.abs(i - 12) / 12) * 0.8)
                          return (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-accent to-accent/60 rounded-full transition-all duration-100 shadow-lg"
                              style={{
                                height: `${barHeight}%`,
                                opacity: 0.8 + (audioLevel * 0.4)
                              }}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Control Button */}
                  <button
                    disabled={connectionStatus !== "connected"}
                    onClick={(e) => {
                      e.preventDefault()
                      console.log("🎤 Button clicked, connectionStatus:", connectionStatus)

                      if (isRecording) {
                        // Stop recording and send audio
                        console.log("🎤 Stopping recording and sending audio")
                        stopRecording()
                      } else {
                        // Start recording
                        console.log("🎤 Starting recording")
                        startRecording()
                      }
                    }}
                    className={cn(
                      "w-full h-24 rounded-2xl flex items-center justify-center gap-4 text-lg font-semibold transition-all duration-300 select-none shadow-2xl relative",
                      isRecording
                        ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/60 text-red-400 shadow-red-500/20"
                        : "bg-gradient-to-r from-accent via-accent to-accent/90 text-black hover:from-accent/90 hover:via-accent/95 hover:to-accent shadow-accent/30 hover:shadow-accent/50"
                    )}
                    style={{
                      touchAction: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none'
                    }}
                  >
                    <div className="relative">
                    {isRecording ? (
                      <>
                          <MicOff className="w-7 h-7" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                      </>
                    ) : (
                      <>
                          <Mic className="w-7 h-7" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </>
                      )}
                    </div>
                    <span className="tracking-wide">
                      {isRecording ? "Click to Send" : "Click to Talk"}
                    </span>
                    {isRecording && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-mono text-red-400">
                        Recording...
                      </div>
                    )}
                  </button>

                  {/* Instructions */}
                  <div className="text-center space-y-3">
                    <div className="bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-card-border/40">
                      <p className="text-sm text-foreground/90 font-medium mb-1">
                      {isRecording 
                          ? "🎙️ Speak now - Catalyst is listening"
                          : "🎯 Click button to start voice conversation"}
                    </p>
                      <div className="flex items-center justify-center gap-3 text-xs text-muted/80 font-mono">
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                          Realtime
                        </span>
                        <span>•</span>
                        <span>PCM16 24kHz</span>
                        <span>•</span>
                        <span className="text-accent font-semibold">Seamless</span>
                      </div>
                    </div>
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

