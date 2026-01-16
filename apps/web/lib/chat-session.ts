/**
 * Chat Session Management
 * 
 * Links browser sessions to Catalyst session IDs for context persistence.
 * Uses sessionStorage so sessions persist across page navigations within the same tab.
 */

const WEB_SESSION_KEY = 'per4ex-web-session'
const CATALYST_SESSION_KEY = 'per4ex-catalyst-session'
const SESSION_TIMESTAMP_KEY = 'per4ex-session-timestamp'

// Session timeout matching Catalyst's in-memory TTL (2 hours)
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000

/**
 * Generate or retrieve the web session ID.
 * Creates a new one if none exists or if expired.
 */
export function getWebSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const existingId = sessionStorage.getItem(WEB_SESSION_KEY)
  const timestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY)
  
  // Check if session is still valid (within TTL)
  if (existingId && timestamp) {
    const age = Date.now() - parseInt(timestamp, 10)
    if (age < SESSION_TIMEOUT_MS) {
      // Refresh timestamp on access
      sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
      return existingId
    }
  }
  
  // Create new session
  const newId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  sessionStorage.setItem(WEB_SESSION_KEY, newId)
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
  
  // Clear any stale Catalyst session
  sessionStorage.removeItem(CATALYST_SESSION_KEY)
  
  return newId
}

/**
 * Store the Catalyst session ID received from the backend.
 */
export function setCatalystSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CATALYST_SESSION_KEY, sessionId)
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
}

/**
 * Get the stored Catalyst session ID.
 */
export function getCatalystSessionId(): string | null {
  if (typeof window === 'undefined') return null
  
  const sessionId = sessionStorage.getItem(CATALYST_SESSION_KEY)
  const timestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY)
  
  // Check if session is still valid
  if (sessionId && timestamp) {
    const age = Date.now() - parseInt(timestamp, 10)
    if (age < SESSION_TIMEOUT_MS) {
      return sessionId
    }
    // Session expired, clear it
    clearSession()
  }
  
  return null
}

/**
 * Check if we have an active session.
 */
export function hasActiveSession(): boolean {
  return getCatalystSessionId() !== null
}

/**
 * Clear all session data (e.g., on logout or manual reset).
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(WEB_SESSION_KEY)
  sessionStorage.removeItem(CATALYST_SESSION_KEY)
  sessionStorage.removeItem(SESSION_TIMESTAMP_KEY)
}

/**
 * Refresh the session timestamp (call on user activity).
 */
export function refreshSessionTimestamp(): void {
  if (typeof window === 'undefined') return
  if (sessionStorage.getItem(CATALYST_SESSION_KEY)) {
    sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
  }
}
