"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TypewriterSubtitleProps {
  text: string
  speed?: number
  className?: string
  cursorColor?: string
}

export function TypewriterSubtitle({ text, speed = 40, className, cursorColor = "bg-accent" }: TypewriterSubtitleProps) {
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
    <div className={cn("text-xl md:text-2xl text-center text-muted min-h-[1.5em] font-mono", className)}>
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className={cn("inline-block w-[10px] h-[1em] ml-1 align-middle", cursorColor)}
      />
    </div>
  )
}
