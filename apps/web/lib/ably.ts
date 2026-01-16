import * as Ably from 'ably'

let ablyClient: Ably.Realtime | null = null

export const BROADCAST_CHANNEL = 'live-discussion'

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: '/api/ably/auth',
      autoConnect: true
    })
  }
  return ablyClient
}

export function disconnectAbly(): void {
  if (ablyClient) {
    try {
      const state = ablyClient.connection?.state
      if (state && state !== 'closed' && state !== 'closing') {
        ablyClient.close()
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to close Ably connection cleanly:', err)
      }
    } finally {
      ablyClient = null
    }
  }
}
