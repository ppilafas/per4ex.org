import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { KNOWLEDGE_BASE_CONTEXT } from "@/lib/knowledge-base";
import { getAISettings } from "@/lib/ai-config";
import { getSystemInstructions } from "@/lib/system-instructions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

const CATALYST_API_URL = process.env.CATALYST_API_URL || "http://localhost:8001/v1";
const API_KEY = process.env.CATALYST_API_KEY;

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface SolutionContext {
  solutionId: string
  solutionTitle: string
  problem: string
  stack?: string[]
}

async function retrieveRAGContext(query: string, requestId: string): Promise<string> {
  if (!OPENAI_API_KEY || !VECTOR_STORE_ID) {
    console.log(`⚠️ [${requestId}] RAG disabled: missing OPENAI_API_KEY or VECTOR_STORE_ID`);
    return KNOWLEDGE_BASE_CONTEXT;
  }

  const startTime = performance.now();
  
  try {
    console.log(`🔍 [${requestId}] Querying Vector Store: ${VECTOR_STORE_ID.slice(0, 20)}...`);
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: query,
        tools: [{
          type: 'file_search',
          vector_store_ids: [VECTOR_STORE_ID],
          max_num_results: 5
        }],
        tool_choice: 'required'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ [${requestId}] Vector Store query failed:`, error.slice(0, 200));
      return KNOWLEDGE_BASE_CONTEXT;
    }

    const data = await response.json();
    const toolCall = data.output?.find((item: { type: string }) => item.type === 'file_search_call');
    
    if (!toolCall || !toolCall.results || toolCall.results.length === 0) {
      console.log(`⚠️ [${requestId}] No RAG results found, falling back to static KB`);
      return KNOWLEDGE_BASE_CONTEXT;
    }

    const ragTime = performance.now() - startTime;
    
    // Format retrieved chunks
    const chunks = toolCall.results.map((result: { filename?: string; attributes?: { text?: string } }, i: number) => ({
      index: i + 1,
      text: result.attributes?.text || '',
      source: result.filename || 'supercore_kb'
    }));

    const context = `
=== RETRIEVED CONTEXT FROM KNOWLEDGE BASE ===
The following information was retrieved based on the user's question:

${chunks.map((c: { index: number; text: string; source: string }) => `[${c.index}] ${c.text}\n(Source: ${c.source})`).join('\n\n')}

=== INSTRUCTIONS ===
Use the retrieved information above to answer the user's question accurately. 
If the retrieved context doesn't fully answer the question, use your general knowledge about Panagiotis Pilafas and Supercore, but prioritize the retrieved sources.
Always cite which source number(s) you used when providing information.
===========================================
`;

    console.log(`✅ [${requestId}] RAG retrieved ${chunks.length} chunks in ${Math.round(ragTime)}ms`);
    
    return context;
  } catch (error) {
    console.error(`💥 [${requestId}] RAG retrieval error:`, error);
    return KNOWLEDGE_BASE_CONTEXT;
  }
}

function buildEnrichedMessages(
  messages: ChatMessage[],
  solution_context: SolutionContext | undefined,
  ragContext: string | undefined,
  systemInstructions: string
): ChatMessage[] {
  const enrichedMessages = [...messages];
  const lastMsgIndex = enrichedMessages.length - 1;
  if (lastMsgIndex >= 0 && enrichedMessages[lastMsgIndex].role === "user") {
      // Use RAG context if available, otherwise fall back to static KB
      const knowledgeContext = ragContext || KNOWLEDGE_BASE_CONTEXT;

      // Base contact protocol
      let contactProtocol = `
=== CONTACT FORM PROTOCOL ===
If the user wants to contact support, send a message, or hire me:
1. REQUIREMENT: You MUST obtain the user's **Email Address**. If missing, ask for it.
2. DEFAULTS: If Name is missing, use 'Guest'. If Message is missing, use 'Inquiry from Chat Widget'.
3. ACTION: Once you have the Email, **IMMEDIATELY** call the 'send_widget_contact_email' tool.
4. PROHIBITION: DO NOT ask for subject lines. DO NOT draft email text. DO NOT ask for confirmation. Just send it.
=============================
`;

      // PROJECT INTAKE PROTOCOL: When user comes from Solutions page
      if (solution_context) {
          const projectIntakeProtocol = `
=== PROJECT INTAKE PROTOCOL ===
You are conducting a project intake for: "${solution_context.solutionTitle}"

THE USER IS INTERESTED IN THIS SOLUTION:
- Solution: ${solution_context.solutionTitle}
- Problem it solves: ${solution_context.problem}
- Tech stack: ${solution_context.stack?.join(', ') || 'To be determined'}

YOUR TASK: Collect project requirements through a friendly, professional conversation.

REQUIRED INFORMATION (collect in this order, ONE question at a time):
1. TIMEFRAME: "When do you need this live?" (Examples: 2 weeks, 1 month, 3 months, flexible)
2. BUDGET: "What's your budget range for this project?" (Examples: $5K-10K, $10K-25K, $25K+, not sure yet)
3. EMAIL: "What's the best email to reach you at?"
4. DETAILS (optional): "Any specific requirements or constraints I should know about?"

CONVERSATION RULES:
- Start by acknowledging their interest in "${solution_context.solutionTitle}" enthusiastically
- Ask ONE question at a time - never multiple questions in one message
- Acknowledge each answer briefly before asking the next question
- If user goes off-topic, respond briefly then redirect: "That's a great point! I'll note that. Now, [next question]..."
- If user wants to skip a question, use defaults: Timeframe="Flexible", Budget="To be discussed"
- Be warm and professional, not robotic

EMAIL IS REQUIRED - politely persist until you have it. Example: "I'd love to follow up with more details - what's the best email to reach you?"

COMPLETION:
Once you have at minimum the EMAIL, immediately call the 'send_widget_contact_email' tool with:
- Name: User's name if mentioned, otherwise "Prospective Client"
- Email: The email they provided
- Message: A structured summary like:
  "PROJECT INQUIRY: ${solution_context.solutionTitle}
   Timeframe: [collected or 'Flexible']
   Budget: [collected or 'To be discussed']
   Details: [any additional details shared]
   Source: Solutions Page - ${solution_context.solutionId}"

AFTER SENDING EMAIL:
- Confirm: "Perfect! I've sent your project details to Panagiotis. He typically responds within 24 hours."
- The intake is COMPLETE - do NOT re-ask timeframe, budget, or email questions
- If the user asks follow-up questions about the solution or project, answer helpfully
- If the user wants to discuss a DIFFERENT solution, that's a new conversation
===============================
`;
          // Replace the contact protocol with project intake when in project mode
          contactProtocol = projectIntakeProtocol;
      }

      enrichedMessages[lastMsgIndex] = {
          ...enrichedMessages[lastMsgIndex],
          content: `${systemInstructions}\n\n${contactProtocol}\n\n${knowledgeContext}\n\nUSER QUESTION:\n${enrichedMessages[lastMsgIndex].content}`
      };
  }

  return enrichedMessages;
}

function createSSEFromTextStream(textStream: AsyncIterable<string>): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const textPart of textStream) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: textPart })}\n\n`));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

async function streamFromCatalyst({
  enrichedMessages,
  session_id,
  catalystApiUrl,
  tenantId,
  requestId,
  startTime
}: {
  enrichedMessages: ChatMessage[]
  session_id: string | null
  catalystApiUrl: string
  tenantId: string
  requestId: string
  startTime: number
}) {
  console.log(`🌐 [${requestId}] Forwarding to Catalyst: ${catalystApiUrl}/chat/stream (Tenant: ${tenantId})`);
  
  const catalystStartTime = performance.now()
  
  const response = await fetch(`${catalystApiUrl}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
      "X-Tenant-Id": tenantId,
    },
    body: JSON.stringify({
      messages: enrichedMessages,
      session_id,
      config: {
        namespace: "supercore-kb",
      },
    }),
  });
  
  const catalystResponseTime = performance.now() - catalystStartTime
  console.log(`📥 [${requestId}] Catalyst response received in ${Math.round(catalystResponseTime)}ms:`, {
    status: response.status,
    statusText: response.statusText,
    hasBody: !!response.body
  });

  if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${requestId}] Catalyst API Error:`, response.status, errorText.slice(0, 500));
      return NextResponse.json({ error: `Catalyst Error: ${response.status} - ${errorText}` }, { status: response.status });
  }

  if (!response.body) {
      console.error(`❌ [${requestId}] No response body from Catalyst`);
      throw new Error("No response body from Catalyst");
  }

  const reader = response.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let chunkCount = 0
  let bytesReceived = 0

  console.log(`🔄 [${requestId}] Starting to stream from Catalyst...`)

  const stream = new ReadableStream({
      async start(controller) {
          try {
              while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    const totalTime = performance.now() - startTime
                    console.log(`✅ [${requestId}] Stream complete: ${chunkCount} chunks, ${bytesReceived} bytes in ${Math.round(totalTime)}ms`)
                    break;
                  }

                  chunkCount++
                  bytesReceived += value?.byteLength || 0
                  
                  if (chunkCount === 1 || chunkCount % 50 === 0) {
                    console.log(`📦 [${requestId}] Chunk #${chunkCount}: ${value?.byteLength || 0} bytes (total: ${bytesReceived})`)
                  }

                  const chunk = decoder.decode(value);
                  controller.enqueue(encoder.encode(chunk));
              }
              controller.close();
          } catch (err) {
              console.error(`💥 [${requestId}] Stream error after ${chunkCount} chunks:`, err);
              controller.error(err);
          }
      }
  });

  const totalTime = performance.now() - startTime
  console.log(`🎉 [${requestId}] Returning SSE stream (${Math.round(totalTime)}ms total setup)`)

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Request-Id": requestId
    },
  });
}

export async function POST(req: NextRequest) {
  const requestId = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const startTime = performance.now()
  
  console.log(`\n🚀 [${requestId}] Chat request started`)
  
  try {
    const body = await req.json();
    const { messages, session_id, solution_context } = body;
    
    console.log(`📦 [${requestId}] Request payload:`, {
      messageCount: messages?.length || 0,
      hasSessionId: !!session_id,
      hasSolutionContext: !!solution_context,
      solutionTitle: solution_context?.solutionTitle || 'none'
    })

    if (!Array.isArray(messages) || messages.length === 0) {
      console.log(`❌ [${requestId}] Missing messages - returning 400`)
      return NextResponse.json({ error: "Missing messages" }, { status: 400 });
    }

    const settings = await getAISettings();
    console.log(`⚙️ [${requestId}] AI Settings:`, {
      aiProvider: settings.aiProvider,
      vercelAiModel: settings.vercelAiModel,
      catalystFallbackEnabled: settings.catalystFallbackEnabled,
      catalystTenantId: settings.catalystTenantId
    })

    const systemInstructions = await getSystemInstructions()

    // Extract user's query for RAG retrieval
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage?.content || '';

    const ragContext = await retrieveRAGContext(userQuery, requestId);
    
    const enrichedMessages = buildEnrichedMessages(
      messages as ChatMessage[],
      solution_context as SolutionContext | undefined,
      ragContext,
      systemInstructions
    );
    console.log(`📝 [${requestId}] Enriched ${enrichedMessages.length} messages (added guardrails/RAG context)`)

    const canUseVercel = settings.aiProvider === "vercel" && Boolean(process.env.OPENAI_API_KEY);
    console.log(`🔌 [${requestId}] Provider selection:`, {
      canUseVercel,
      openaiKeyExists: !!process.env.OPENAI_API_KEY,
      selectedProvider: canUseVercel ? 'vercel/openai' : 'catalyst'
    })

    if (canUseVercel) {
      try {
        console.log(`🤖 [${requestId}] Using Vercel AI SDK with model: ${settings.vercelAiModel || "gpt-5-mini"}`)
        
        const result = streamText({
          model: openai(settings.vercelAiModel || "gpt-5-mini"),
          messages: enrichedMessages.map((msg) => ({ role: msg.role === "system" ? "user" : msg.role, content: msg.content })),
        });

        console.log(`✅ [${requestId}] streamText initiated, creating SSE stream...`)
        
        const stream = createSSEFromTextStream(result.textStream);
        
        const totalTime = performance.now() - startTime
        console.log(`🎉 [${requestId}] Vercel path ready in ${Math.round(totalTime)}ms, returning SSE stream`)
        
        return new NextResponse(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Request-Id": requestId
          },
        });
      } catch (error) {
        console.error(`💥 [${requestId}] Vercel AI path failed:`, error);
        if (!settings.catalystFallbackEnabled) {
          console.log(`🚫 [${requestId}] Fallback disabled, returning 500`)
          return NextResponse.json({ error: "Vercel AI path failed and fallback is disabled" }, { status: 500 });
        }
        console.log(`🔄 [${requestId}] Falling back to Catalyst...`)
      }
    }

    const tenantId = settings.catalystTenantId || process.env.CATALYST_TENANT_ID || "catalyst_widget";
    const catalystApiUrl = settings.catalystApiUrl || CATALYST_API_URL;
    
    console.log(`🌐 [${requestId}] Proxying to Catalyst:`, {
      url: `${catalystApiUrl}/chat/stream`,
      tenantId,
      sessionId: session_id || 'new'
    })

    return streamFromCatalyst({
      enrichedMessages,
      session_id: session_id || null,
      catalystApiUrl,
      tenantId,
      requestId,
      startTime
    });

  } catch (error: unknown) {
    const totalTime = performance.now() - startTime
    console.error(`💥 [${requestId}] Fatal error after ${Math.round(totalTime)}ms:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
