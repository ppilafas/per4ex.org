"use client"

import { MessageSquare } from "lucide-react"

export function CTAButton() {
  return (
    <button 
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-chat'));
      }}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-black transition-colors hover:bg-accent/90"
    >
      <MessageSquare className="w-4 h-4" />
      Discuss a project
    </button>
  )
}
