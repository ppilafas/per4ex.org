"use client"

import Link from "next/link"
import { useState } from "react"
import { CaretUp as ChevronUp, CaretDown as ChevronDown } from "@phosphor-icons/react"
export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-card-border bg-background/95 backdrop-blur-md text-center text-muted text-sm">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div />
          <p className="text-xs sm:text-sm text-center truncate">
            © {new Date().getFullYear()} Systems Engineer | AI Ecosystems Specialist — Built with Next.js & Tailwind
          </p>
          <div className="justify-self-end">
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse footer" : "Expand footer"}
              className="shrink-0 inline-flex items-center gap-1 rounded-md border border-card-border px-1.5 py-0.5 text-xs hover:text-accent hover:border-accent/60 transition-colors"
            >
              {isExpanded ? "Less" : "More"}
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Catalyst App Description - Discreet */}
            <p className="mt-2 mb-1 text-xs text-muted/70 max-w-2xl mx-auto leading-relaxed">
              <strong className="text-muted">Catalyst</strong> is the assistant runtime behind several Supercore proof projects, combining RAG, voice, tool calling, and tenant-scoped data.{" "}
              <Link href="/catalyst-ai" className="text-muted/60 hover:text-accent transition-colors duration-200">
                Learn more
              </Link>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
              <Link
                href="/privacy"
                className="text-muted hover:text-accent transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <span className="text-card-border">•</span>
              <Link
                href="/terms"
                className="text-muted hover:text-accent transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
