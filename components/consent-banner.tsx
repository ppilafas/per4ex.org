"use client"

import { useEffect, useState } from "react"

// Consent Mode v2 CMP. Pairs with components/analytics-tags.tsx, which sets
// the `denied` default before gtag.js. This banner records the visitor's
// choice and issues `gtag('consent','update', …)` — what raises the consent
// rate (clears Google's "0% consent" warning) and, on accept, unlocks
// precise GA4/Ads measurement incl. inside the EEA.

const STORAGE_KEY = "sc-consent-v1"
type Choice = "granted" | "denied"

// Push exactly like the official gtag shim (dataLayer.push(arguments)), so it
// works whether or not gtag.js has finished loading — the update is queued
// after the default and processed in order.
function pushConsentUpdate(choice: Choice) {
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  function gtag(...args: unknown[]) {
    w.dataLayer!.push(args)
  }
  gtag("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  })
}

export function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* private mode / blocked storage — just show the banner */
    }
    if (stored === "granted" || stored === "denied") {
      pushConsentUpdate(stored)
    } else {
      setShow(true)
    }
  }, [])

  if (!show) return null

  const choose = (choice: Choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      /* ignore — choice still applies for this session */
    }
    pushConsentUpdate(choice)
    setShow(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-card-border bg-card/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          We use analytics cookies to measure how this site is used — first-party
          only, nothing sold or shared.{" "}
          <a href="/privacy" className="text-accent hover:underline">
            Privacy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("denied")}
            className="rounded-lg border border-card-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent/50"
          >
            Decline
          </button>
          <button
            onClick={() => choose("granted")}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
