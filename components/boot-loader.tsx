"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Toggle to enable/disable boot sequence video
const ENABLE_BOOT_SEQUENCE = process.env.NEXT_PUBLIC_ENABLE_BOOT_SEQUENCE !== "false" && false // Set to true to enable

export function BootLoader() {
  // If disabled, return null immediately
  if (!ENABLE_BOOT_SEQUENCE) {
    return null
  }

  const [isVisible, setIsVisible] = useState(false) // Default to false to avoid flash on server render
  const [hasPlayed, setHasPlayed] = useState(false)

  useEffect(() => {
    // Check session storage on mount (client-side only)
    const sessionPlayed = sessionStorage.getItem("boot_sequence_played")
    
    if (!sessionPlayed) {
      setIsVisible(true)
    } else {
      setHasPlayed(true)
    }
  }, [])

  const handleVideoEnd = () => {
    sessionStorage.setItem("boot_sequence_played", "true")
    setIsVisible(false)
    setTimeout(() => setHasPlayed(true), 1000) // Allow exit animation to finish
  }

  if (hasPlayed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
          <video
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src="/boot-sequence.mp4" type="video/mp4" />
          </video>
          
          {/* Skip button for impatient users */}
          <button 
            onClick={handleVideoEnd}
            className="absolute bottom-8 right-8 text-xs text-white/50 hover:text-white font-mono uppercase tracking-widest border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition-colors"
          >
            Skip Boot Sequence
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

