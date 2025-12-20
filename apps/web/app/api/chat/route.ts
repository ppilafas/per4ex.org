import { NextRequest, NextResponse } from "next/server";

// Configuration for Local Catalyst Service
const CATALYST_API_URL = process.env.CATALYST_API_URL || "http://localhost:8001/v1";
const TENANT_ID = process.env.CATALYST_TENANT_ID || "catalyst-widget";
const API_KEY = process.env.CATALYST_API_KEY || "tFPZOuFKpEy3it5cqrB0alHXAOG2iRuJpHGppFPnRuM"; 

const SYSTEM_PROMPT = `
You are the AI Assistant for Per4ex.org, the portfolio of Panagiotis Pilafas.
Your knowledge comes STRICTLY from the "Per4ex Knowledge Base" file available via your tools.

CRITICAL INSTRUCTIONS:
1. You MUST use the available RAG/Search tool to look up information before answering ANY technical question.
2. Do NOT answer from your general training data. 
3. When asked about "Voice Mode", you MUST mention the "Realtime" (PCM16) and "Chained" architectures specifically.
4. When asked about Catalyst AI, verify details like "launchd daemon" and "Zero-Dependency".

BEHAVIOR:
- Professional, technical, concise.
- Refuse personal data requests.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, session_id } = body;

    // Inject System Prompt at the beginning of the conversation
    const clientMessages = messages.filter((m: any) => m.role !== "system");
    const augmentedMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...clientMessages
    ];

    console.log("--- PROXY REQUEST START ---");
    console.log("Messages sending:", JSON.stringify(augmentedMessages, null, 2));

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
        messages: augmentedMessages,
        stream: true,
        model: "gpt-4o",
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
                    console.log("Catalyst Stream Chunk:", chunk.substring(0, 200) + (chunk.length > 200 ? "..." : "")); // Log preview
                    
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
