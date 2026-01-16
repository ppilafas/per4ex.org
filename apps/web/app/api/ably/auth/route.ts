import * as Ably from 'ably'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: 'Missing ABLY_API_KEY environment variable' },
      { status: 500 }
    )
  }

  try {
    const client = new Ably.Rest(process.env.ABLY_API_KEY)

    // Viewers get subscribe-only tokens (public read access)
    // No authentication required for the portfolio site
    const channelName = 'live-discussion'
    
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: 'viewer-' + Math.random().toString(36).substring(2, 15),
      capability: { [channelName]: ['subscribe'] }
    })

    return NextResponse.json(tokenRequestData)
  } catch (error) {
    console.error('Error creating Ably token request:', error)
    return NextResponse.json(
      { error: 'Failed to create token request' },
      { status: 500 }
    )
  }
}
