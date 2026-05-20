"use client"

import { useEffect } from "react"

// Google Ads tag — from the Ads account (public by nature, safe to commit).
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18169860349"

// GA4 Measurement ID — looks like "G-XXXXXXXXXX".
// Set NEXT_PUBLIC_GA4_ID (Vercel env + .env.local) once the GA4 property exists.
// Until it's set, GA4 config is skipped and only the Ads tag loads.
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ""

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

// Inline init: defines dataLayer + gtag shim, sets Consent Mode v2 defaults
// BEFORE any hit, then registers ads/GA4 configs. Plain <script
// dangerouslySetInnerHTML> (not next/script) — next/script's
// strategy="afterInteractive" with inline children was empirically failing
// to execute in production (gtag.js loader fetched fine but no /g/collect
// requests ever fired). Plain script tag matches Google's official snippet
// and is the reliable path for Consent Mode init ordering.
const INIT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('js', new Date());
${ADS_ID ? `gtag('config','${ADS_ID}');` : ""}
${GA4_ID ? `gtag('config','${GA4_ID}');` : ""}
`.trim()

const LOADER_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID || ADS_ID}`

export function AnalyticsTags() {
  useEffect(() => {
    // Fire on the same custom event the site already uses to open the assistant
    // (dispatched by components/cta-button.tsx). No CTA edits needed.
    const onAssistantOpen = () => {
      window.gtag?.("event", "assistant_open", {
        event_category: "engagement",
        page_path: window.location.pathname,
      })
    }

    // Delegated: any mailto click anywhere (hero CTA, footer, /private-ai, etc.)
    const onMailClick = (e: MouseEvent) => {
      const anchor =
        e.target instanceof Element
          ? (e.target.closest('a[href^="mailto:"]') as HTMLAnchorElement | null)
          : null
      if (!anchor) return
      window.gtag?.("event", "email_click", {
        event_category: "engagement",
        link_url: anchor.getAttribute("href") || "",
        page_path: window.location.pathname,
      })
    }

    window.addEventListener("open-chat", onAssistantOpen)
    document.addEventListener("click", onMailClick, true)
    return () => {
      window.removeEventListener("open-chat", onAssistantOpen)
      document.removeEventListener("click", onMailClick, true)
    }
  }, [])

  if (!ADS_ID && !GA4_ID) return null

  return (
    <>
      {/* Inline init MUST render before the loader so consent default and
          dataLayer queue are set up first. React renders in document order. */}
      <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
      <script async src={LOADER_SRC} />
    </>
  )
}
