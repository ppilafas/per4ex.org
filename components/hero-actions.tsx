"use client"

import { MessageSquare } from "lucide-react"

export function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <button 
        onClick={() => {
          console.log('Dispatching open-chat event');
          window.dispatchEvent(new CustomEvent('open-chat'));
        }}
        className="px-6 py-3 bg-accent text-black rounded-full font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Start a Project</span>
      </button>
    </div>
  )
}
