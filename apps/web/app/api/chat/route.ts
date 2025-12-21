import { NextRequest, NextResponse } from "next/server";

// Configuration
const CATALYST_API_URL = process.env.CATALYST_API_URL || "http://localhost:8001/v1";
const TENANT_ID = process.env.CATALYST_TENANT_ID || "catalyst-widget";
const API_KEY = process.env.CATALYST_API_KEY;

if (!API_KEY) {
  console.warn("CATALYST_API_KEY is not set. Chat functionality will fail.");
} 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, session_id } = body;

    // Catalyst Server now manages System Prompts and Models centrally.
    // We only pass user messages and session config.

    // WORKAROUND: Inject Knowledge Base as system context until backend RAG is fixed.
    // This allows the model to answer specific questions without RAG tool calls.
    const KB_CONTEXT = `
SYSTEM CONTEXT - KNOWLEDGE BASE:
# Per4ex.org Knowledge Base - Panagiotis Pilafas
## 1. Professional Profile
**Name:** Panagiotis Pilafas  
**Role:** Systems Engineer / AI Architect / Full Stack Engineer  
**Tagline:** "Specialized in AI-Related Ecosystems. From 6502 Assembly to Distributed Intelligent Agents."  
**Website:** https://per4ex.org  
**Contact:** contact@per4ex.org  

### Engineering Philosophy
Panagiotis is not a "glue code" developer; he is a systems engineer. His philosophy is defined by:
- **Zero-Dependency Architecture:** He prefers building custom, lightweight orchestration engines (like Catalyst) over heavy frameworks (like LangChain) to ensure deterministic control, micro-latency, and easier debugging.
- **Hard Multi-Tenancy:** Systems are designed from day one to be secure and isolated (e.g., using Postgres RLS), not retrofitted later.
- **Cost-Aware Intelligence:** He architects systems that route easy tasks to cheap models (Gemini Flash, Haiku) and hard tasks to reasoning models (GPT-4o), optimizing unit economics.
- **Stateful Services:** He builds persistent daemons (macOS launchd, Linux systemd) rather than stateless scripts, enabling proactive AI behavior.

### Historical Background
- **Roots:** Started programming in the 1980s.
- **Low-Level:** Has experience with 6502 Assembly and C, giving him a deep understanding of memory management and resource efficiency.
- **Evolution:** Transitioned through the web revolution into distributed systems and now focuses on Generative AI infrastructure.

## 2. Core Platform: Catalyst AI
**Type:** Proprietary AI Operating System / Backend Service  
**Architecture:** Python 3.11+, FastAPI (REST), WebSockets, macOS launchd daemon.
### Key Capabilities
1.  **Multi-Modal Voice:** Realtime Mode (GPT Realtime + PCM16) & Chained Mode (Whisper -> Router -> TTS).
2.  **Hard Security:** Tenant Isolation via X-Tenant-Id & Postgres RLS. No-Leakage Proxy.
3.  **RAG Engine:** Hybrid search (pgvector + Keyword).
4.  **Native Clients:** SwiftUI (macOS), Tauri (Web Dashboard).

## 3. Flagship Project: π.Law (Pi.Law)
**Type:** Enterprise Legal AI CRM  
**Stack:** Next.js 16, Tailwind, FastAPI Proxy, Catalyst Core, Postgres (pgvector).
**Solution:** Zero-Leakage Architecture. Frontend talks to Proxy, which injects Tenant ID and strips PII before forwarding to Catalyst Core.

## 4. Authored Works
**Book:** *Cosmic Dice: Putting Consciousness at the Helm of the Universe*  
**Themes:** Systems philosophy, agency, and probabilistic decision-making.

## 5. Technical Skills
**Languages:** Python, TypeScript, Go, Swift, Rust, SQL, Assembly.  
**AI Stack:** OpenAI, Anthropic, Gemini, HuggingFace, pgvector, Pinecone.  
**Infrastructure:** Docker, K8s, AWS, GCP, Vercel, Fly.io.
**Web:** Next.js, React, Tailwind.  
**Database:** PostgreSQL, Redis, SQLite.
`;

    // Prepend system context to the message history if it's a new session or just ensure it's there.
    // Since we can't easily inject a "system" role if the backend filters it, we'll append it to the LAST user message 
    // as a hidden context block, OR if the backend supports "system" role passing (which it might filter), 
    // we'll try to prepend a system message.
    
    // Strategy: Prepend a system message. If Catalyst filters it, we might need to append to the first user message.
    // Based on previous logs, Catalyst "manages system prompts centrally", so it likely ignores client-sent system messages.
    // FALLBACK: Append to the latest user message as context.
    
    const enrichedMessages = [...messages];
    const lastMsgIndex = enrichedMessages.length - 1;
    if (lastMsgIndex >= 0 && enrichedMessages[lastMsgIndex].role === "user") {
        enrichedMessages[lastMsgIndex] = {
            ...enrichedMessages[lastMsgIndex],
            content: `${KB_CONTEXT}\n\nUSER QUESTION:\n${enrichedMessages[lastMsgIndex].content}`
        };
    }

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
        }
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
                    // console.log("Catalyst Stream Chunk:", chunk); // Log full chunk to terminal
                    controller.enqueue(encoder.encode(chunk));
                }
                // console.log("--- PROXY REQUEST END ---");
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
