"use client"

import { useState } from "react"
import type { AISettings } from "@/lib/ai-config"

interface Props {
  initialSettings: AISettings
  initialSystemInstructions: string
}

export function AdminAISettings({ initialSettings, initialSystemInstructions }: Props) {
  const [settings, setSettings] = useState<AISettings>(initialSettings)
  const [systemInstructions, setSystemInstructions] = useState<string>(initialSystemInstructions)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingInstructions, setIsSavingInstructions] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [instructionsStatus, setInstructionsStatus] = useState<string | null>(null)

  const save = async () => {
    setIsSaving(true)
    setStatus(null)

    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save settings")
      }

      const updated = (await res.json()) as AISettings
      setSettings(updated)
      setStatus("Saved")
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Failed")
    } finally {
      setIsSaving(false)
    }
  }

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.reload()
  }

  const reloadInstructions = async () => {
    setIsSavingInstructions(true)
    setInstructionsStatus(null)

    try {
      const res = await fetch("/api/admin/system-instructions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load instructions")
      }

      const data = (await res.json()) as { instructions: string }
      setSystemInstructions(data.instructions)
      setInstructionsStatus("Loaded")
    } catch (error: unknown) {
      setInstructionsStatus(error instanceof Error ? error.message : "Failed")
    } finally {
      setIsSavingInstructions(false)
    }
  }

  const saveInstructions = async () => {
    setIsSavingInstructions(true)
    setInstructionsStatus(null)

    try {
      const res = await fetch("/api/admin/system-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: systemInstructions }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save instructions")
      }

      const updated = (await res.json()) as { instructions: string }
      setSystemInstructions(updated.instructions)
      setInstructionsStatus("Saved")
    } catch (error: unknown) {
      setInstructionsStatus(error instanceof Error ? error.message : "Failed")
    } finally {
      setIsSavingInstructions(false)
    }
  }

  return (
    <div className="space-y-6 py-8">
      <div className="glass-panel border border-card-border/50 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Runtime Settings</h1>
          <p className="text-sm text-muted">Model: {settings.model}</p>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-lg border border-card-border text-sm hover:bg-card/30">
          Logout
        </button>
      </div>

      <div className="glass-panel border border-card-border/50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Chat Model">
            <input
              className="input"
              value={settings.model}
              onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
              placeholder="gemini-2.0-flash"
            />
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-accent text-black font-semibold disabled:opacity-60">
            {isSaving ? "Saving..." : "Save settings"}
          </button>
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>
      </div>

      <div className="glass-panel border border-card-border/50 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">System Instructions</h2>
            <p className="text-sm text-muted">These are injected into every chat request.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadInstructions}
              disabled={isSavingInstructions}
              className="px-4 py-2 rounded-lg border border-card-border text-sm hover:bg-card/30 disabled:opacity-60"
            >
              Reload
            </button>
            <button
              onClick={saveInstructions}
              disabled={isSavingInstructions}
              className="px-4 py-2 rounded-lg bg-accent text-black font-semibold disabled:opacity-60"
            >
              {isSavingInstructions ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <textarea
          className="w-full min-h-[420px] rounded-xl border border-card-border bg-background/40 px-4 py-3 font-mono text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          value={systemInstructions}
          onChange={(e) => setSystemInstructions(e.target.value)}
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted">Tip: keep instructions stable; update in small iterations.</span>
          {instructionsStatus && <span className="text-sm text-muted">{instructionsStatus}</span>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted">{label}</label>
      {children}
    </div>
  )
}
