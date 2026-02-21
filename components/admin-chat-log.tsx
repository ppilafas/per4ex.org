"use client"

import { useState, useEffect } from "react"
import type { ChatLogEntry } from "@/lib/chat-log"

export function AdminChatLog() {
  const [entries, setEntries] = useState<ChatLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/chat-log")
      if (!res.ok) throw new Error("Failed to load")
      const data = (await res.json()) as { entries: ChatLogEntry[] }
      setEntries(data.entries)
    } catch {
      setStatus("Failed to load logs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const clearLog = async () => {
    if (!confirm("Clear all chat logs?")) return
    try {
      await fetch("/api/admin/chat-log", { method: "DELETE" })
      setEntries([])
      setStatus("Cleared")
    } catch {
      setStatus("Failed to clear")
    }
  }

  return (
    <div className="glass-panel border border-card-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Widget Interaction Log</h2>
          <p className="text-sm text-muted">{entries.length} interactions recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-card-border text-sm hover:bg-card/30 disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={clearLog}
            className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10"
          >
            Clear
          </button>
        </div>
      </div>

      {status && <p className="text-sm text-muted">{status}</p>}

      {entries.length === 0 && !isLoading && (
        <p className="text-sm text-muted/60 italic py-4">No interactions logged yet.</p>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-card/30 border border-card-border/30 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted/60">
              <span>{new Date(entry.ts).toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <span>{entry.durationMs}ms</span>
                {entry.hasSolutionContext && (
                  <span className="bg-accent/20 text-accent px-1.5 py-0.5 rounded text-[9px]">
                    {entry.solutionTitle || "Project"}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs">
              <span className="text-accent font-medium">User:</span>{" "}
              <span className="text-foreground/80">{entry.userMessage}</span>
            </div>
            <div className="text-xs">
              <span className="text-green-400 font-medium">AI:</span>{" "}
              <span className="text-foreground/60">{entry.assistantMessage.slice(0, 200)}{entry.assistantMessage.length > 200 ? "..." : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
