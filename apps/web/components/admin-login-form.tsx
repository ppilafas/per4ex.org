"use client"

import { FormEvent, useState } from "react"

export function AdminLoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Login failed")
      }

      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="glass-panel border border-card-border/50">
        <h1 className="text-2xl font-bold text-foreground mb-6">Admin Login</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">Username</label>
            <input
              className="w-full bg-background/80 border border-card-border rounded-xl px-4 py-2.5"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-1 block">Password</label>
            <input
              type="password"
              className="w-full bg-background/80 border border-card-border rounded-xl px-4 py-2.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-black rounded-xl py-2.5 font-semibold disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
