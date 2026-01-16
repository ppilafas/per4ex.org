"use client"

import { MessageSquare } from "lucide-react"

export function CTAButton() {
  return (
    <button 
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-chat'));
      }}
      className="bg-accent text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-accent/90 transition-colors inline-flex items-center justify-center gap-2 mb-4"
    >
      <MessageSquare className="w-5 h-5" />
      Start a Project
    </button>
  )
}
