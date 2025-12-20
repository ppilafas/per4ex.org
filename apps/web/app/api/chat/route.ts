import { NextRequest, NextResponse } from "next/server";

// Configuration for Local Catalyst Service
const CATALYST_API_URL = process.env.CATALYST_API_URL || "http://localhost:8001/v1";
const TENANT_ID = process.env.CATALYST_TENANT_ID || "catalyst-widget";
const API_KEY = process.env.CATALYST_API_KEY || "tFPZOuFKpEy3it5cqrB0alHXAOG2iRuJpHGppFPnRuM"; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, session_id } = body;

    // Catalyst Server now manages System Prompts and Models centrally.
    // We only pass user messages and session config.

    console.log("--- PROXY REQUEST START ---");
    console.log("Session:", session_id);

    // Forward to Catalyst Service
    const response = await fetch(`${CATALYST_API_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "X-Tenant-Id": TENANT_ID,
        // Forward request ID if useful for tracing
        // "X-Request-Id": crypto.randomUUID()
      },
      body: JSON.stringify({
        messages: messages, // Just pass the user/assistant history
        session_id: session_id, // Important for continuity
        config: {
            namespace: "per4ex-kb" // Scope RAG to our KB
        },
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Catalyst API Error:", response.status, errorText);
        return NextResponse.json({ error: `Catalyst Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    if (!response.body) {
        throw new Error("No response body from Catalyst");
    }

    // Intercept stream for logging while passing it through
    const reader = response.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    console.log("Catalyst Stream Chunk:", chunk); // Log full chunk to terminal
                    controller.enqueue(encoder.encode(chunk));
                }
                console.log("--- PROXY REQUEST END ---");
                controller.close();
            } catch (err) {
                console.error("Stream Error:", err);
                controller.error(err);
            }
        }
    });

    // Stream the response back to the client
    return new NextResponse(stream, {
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
