/**
 * GA4 Measurement Protocol — server-side conversion ingestion.
 *
 * Fires the `qualified_enquiry` event from the server when a real lead is
 * captured. Server-side so it survives ad-blockers and consent-denied
 * browsers (where the client gtag is cookieless/modeled). This is the
 * authoritative conversion to import into Google Ads.
 *
 * Write-only. No PII is ever sent (GA4 policy + consent): only the lead
 * source and capture method. Best-effort: never throws, never blocks the
 * lead flow — analytics failing must not break a real enquiry.
 */

const ENDPOINT = "https://www.google-analytics.com/mp/collect"

/**
 * Extract the GA4 client_id from a raw `_ga` cookie value.
 * Format: `GA1.1.<clientId-part1>.<clientId-part2>` → `part1.part2`.
 * Returns undefined if the cookie is absent/malformed.
 */
export function gaClientIdFromCookie(gaCookie: string | undefined): string | undefined {
  if (!gaCookie) return undefined
  const parts = gaCookie.split(".")
  if (parts.length < 4) return undefined
  return parts.slice(-2).join(".")
}

export async function sendQualifiedEnquiry(opts: {
  source: string
  /** GA4 client_id from the browser `_ga` cookie. If absent, a synthetic id
   *  is used — the conversion still counts but won't join the web session. */
  clientId?: string
  requestId?: string
}): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA4_ID
  const apiSecret = process.env.GA4_API_SECRET
  const tag = opts.requestId ? `[${opts.requestId}] ` : ""

  if (!measurementId || !apiSecret) {
    console.log(`${tag}GA-MP: skipped (GA4 env not configured)`)
    return
  }

  const clientId =
    opts.clientId || `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000)
  try {
    const res = await fetch(
      `${ENDPOINT}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          client_id: clientId,
          events: [
            {
              name: "qualified_enquiry",
              params: {
                source: opts.source,
                method: "assistant",
                engagement_time_msec: 1,
              },
            },
          ],
        }),
      }
    )
    if (!res.ok) {
      console.error(`${tag}GA-MP: non-OK ${res.status}`)
    } else {
      console.log(`${tag}GA-MP: qualified_enquiry sent (source=${opts.source})`)
    }
  } catch (err) {
    // Swallow — analytics must never break lead capture.
    console.error(`${tag}GA-MP: send failed`, err instanceof Error ? err.message : err)
  } finally {
    clearTimeout(timeout)
  }
}
