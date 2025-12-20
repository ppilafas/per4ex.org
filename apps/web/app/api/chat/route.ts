import { NextRequest, NextResponse } from "next/server";

// Configuration for Local Catalyst Service
const CATALYST_API_URL = process.env.CATALYST_API_URL || "http://localhost:8001/v1";
const TENANT_ID = process.env.CATALYST_TENANT_ID || "default";
const API_KEY = process.env.CATALYST_API_KEY || "sk-dev-key"; // Replace with real local key if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, session_id } = body;

    // Forward to Catalyst Service
    const response = await fetch(`${CATALYST_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Tenant-Id": TENANT_ID,
        ...(session_id && { "X-Session-Id": session_id }),
      },
      body: JSON.stringify({
        messages,
        stream: true,
        model: "gpt-4o", // Or allow client to specify
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `Catalyst Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

