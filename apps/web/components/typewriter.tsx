"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function TypewriterSubtitle({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("")
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return // Prevent double firing in Strict Mode
    startedRef.current = true

    let i = 0
    setDisplayedText("") 
    
    const interval = setInterval(() => {
      if (i < text.length) {
        // Use functional update but rely on local 'i' to ensure correct char
        const char = text.charAt(i)
        setDisplayedText((prev) => prev + char)
        i++
      } else {
        clearInterval(interval)
      }
    }, 1000 / speed)

    return () => {
      clearInterval(interval)
      startedRef.current = false
    }
  }, [text, speed])

  return (
    <div className="text-xl md:text-2xl text-center text-muted mb-12 min-h-[2em] font-mono">
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[10px] h-[1em] bg-accent ml-1 align-middle"
      />
    </div>
  )
}
