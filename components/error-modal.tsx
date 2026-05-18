"use client"

import Link from "next/link"
import { Warning as AlertTriangle } from "@phosphor-icons/react"
interface ErrorModalProps {
  title?: string
  description?: string
  errorMessage?: string
  onRetry?: () => void
  onReload?: () => void
}

export function ErrorModal({
  title = "Something went wrong",
  description = "We hit an unexpected error while loading this page.",
  errorMessage,
  onRetry,
  onReload
}: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#121212]/95 p-8 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-500/10 p-3 text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="text-xs uppercase tracking-wider text-white/40">Error details</div>
            <div className="mt-2 text-sm font-mono text-white/80 break-words">{errorMessage}</div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {onRetry ? (
            <button
              onClick={onRetry}
              className="rounded-full bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/25"
            >
              Try again
            </button>
          ) : null}
          {onReload ? (
            <button
              onClick={onReload}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Reload
            </button>
          ) : null}
          <Link
            href="/"
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
