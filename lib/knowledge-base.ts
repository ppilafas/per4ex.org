/**
 * Knowledge Base Context for Supercore
 * This context is injected into chat messages to provide the AI with information
 * about Panagiotis Pilafas and his work.
 */

export const KNOWLEDGE_BASE_CONTEXT = `
SYSTEM CONTEXT - KNOWLEDGE BASE:
# Supercore Knowledge Base - Panagiotis Pilafas
## 1. Professional Profile
**Name:** Panagiotis Pilafas  
**Role:** Systems Engineer / AI Architect / Full Stack Engineer  
**Tagline:** "Specialized in AI-Related Ecosystems. From 6502 Assembly to Distributed Intelligent Agents."  
**Website:** https://supercore.tech  
**Contact:** contact@supercore.tech (for project inquiries, do NOT redirect to contact form — give this email directly)  

### Current Site Positioning
Supercore is a concise portfolio for practical AI systems engineering. The main story is:
- Panagiotis helps teams turn messy data, workflows, and product ideas into working AI software.
- The strongest proof projects are Catalyst AI, π.Law, Forensic AI Studio, and Silicon Smackdown.
- Detailed project pages are supporting proof. Do not list every project unless the user asks.
- Use plain language first, then add technical detail when it helps the user's decision.

### Engineering Philosophy
Panagiotis is a systems engineer who focuses on useful, maintainable AI software rather than impressive demos. His philosophy is defined by:
- **Workflow First:** Start with the business or user workflow, then choose the model and architecture.
- **Explicit Boundaries:** Sensitive data should be scoped, logged, and deliberately exposed only where needed.
- **Lightweight Runtime Control:** He often builds custom orchestration when off-the-shelf frameworks hide too much behavior.
- **Cost-Aware Intelligence:** He architects systems that route easy tasks to cheap models (Gemini Flash, Haiku) and hard tasks to reasoning models (GPT-4o), optimizing unit economics.
- **Stateful Services:** He builds persistent daemons (macOS launchd, Linux systemd) rather than stateless scripts, enabling proactive AI behavior.

### Historical Background
- **Roots:** Started programming in the 1980s.
- **Low-Level:** Has experience with 6502 Assembly and C, giving him a deep understanding of memory management and resource efficiency.
- **Evolution:** Transitioned through the web revolution into distributed systems and now focuses on Generative AI infrastructure.

## 2. Core Platform: Catalyst AI
**Type:** Multi-tenant AI assistant runtime and proof platform  
**Status:** Operational and used as the base runtime behind multiple projects  
**Architecture:** Python 3.11+, FastAPI (REST), WebSockets, PostgreSQL + pgvector  
**Deployment:** 
- Backend: Fly.io (https://catalyst-service.fly.dev/v1)
- Frontend: Vercel (Next.js web dashboard)
- Database: Fly.io Managed PostgreSQL with pgvector extension

### Key Capabilities
1.  **Multi-Modal Voice:** 
    - Realtime Mode (GPT Realtime API + PCM16) for ultra-low latency (&lt;300ms)
    - Chained Mode (Whisper → Router → TTS) for cost-efficient structured tasks
    - Voice Activity Detection (VAD) and Push-to-Talk (PTT) modes

2.  **Hard Multi-Tenancy:** 
    - API key authentication with tenant binding
    - Database-level isolation (PostgreSQL Row Level Security)
    - Per-tenant rate limits and policies
    - Tenant-scoped logging and encryption

3.  **Advanced RAG Engine:** 
    - PostgreSQL with pgvector extension for vector search
    - Hybrid search (cosine similarity + keyword)
    - Multiple vector stores per tenant
    - Optional AES-256-GCM encryption for files and content
    - File support: PDF, DOCX, TXT with server-side extraction
    - Namespace scoping for organization
    - Optional OpenAI file_search integration

4.  **Integrated Tools & Services:**
    - Google Integration: Gmail, Calendar, Drive (with explicit user consent)
    - Web search for real-time information retrieval
    - SQL tools with allowlisting
    - Structured extraction (legal documents, deadlines)
    - One-shot Copilot for instant document analysis

5.  **Production Features:**
    - User management with role-based access
    - Token allowance system for test users
    - Audit logging and observability
    - Per-tenant LLM routing (server-side model selection)
    - Proactive messaging and background data fetching
    - Session management with automatic summarization
    - Token tracking and analytics

6.  **Native Clients:** 
    - SwiftUI (macOS) for zero-latency audio handling
    - Tauri (cross-platform) for web dashboard
    - Next.js dashboard replacing legacy Streamlit UI

## 3. Proof Project: π.Law (Pi.Law)
**Type:** Legal AI CRM  
**Stack:** Next.js 16, Tailwind, FastAPI Proxy, Catalyst Core, Postgres (pgvector).
**Solution:** Sensitive legal data is kept behind an application proxy. The frontend talks to the proxy, which injects tenant context and limits what reaches the AI layer.

## 4. Forensic AI Studio
**Type:** Private AI Investigator for Legal Cases  
**Status:** Private tool (not a public product)  
**Description:** A private AI investigator built for a real legal case. It ingests evidence, maps entity relationships, analyzes audio recordings, and reasons across 100K+ documents in real-time. Combines RAG, entity extraction, and multi-modal analysis (text + audio).
**MCP Innovation:** Exposes investigation tools via Model Context Protocol (MCP), turning VS Code + Copilot into the agent runtime. Chat memory hooks persist IDE conversations to PostgreSQL.
**Capabilities:**
- Evidence ingestion and processing
- Entity relationship mapping
- Audio recording analysis
- Cross-document reasoning (100K+ docs)
- Real-time investigation assistance
- Multi-agent delegation within IDE

## 5. Silicon Smackdown
**Type:** Real-time Voice AI Talk Show Platform
**URL:** https://ssd.supercore.tech
**Built for:** Google Gemini Developer Competition
**Description:** Silicon Smackdown is a real-time AI talk show where AI personalities engage in full-duplex voice debates. It demonstrates live audio orchestration, turn-taking, and Gemini Live API integration.
**Tech Stack:** Gemini Live API, WebSockets, Real-time audio streaming
**Key Features:**
- Full-duplex voice conversations
- 20+ AI personality pairs (historical figures, tech leaders, fictional characters)
- Sub-100ms latency for natural conversation flow
- Real-time debate moderation
- Live audience viewing

## 5. The Supercore Show
**Type:** Live Multi-Agent Broadcast System
**URL:** https://show.supercore.tech
**Description:** A live broadcast where AI agents debate topics in real-time. Three AI agents (host + 2 guests) engage in unscripted debates on technology, ethics, and future of work. Viewers watch conversations unfold word-by-word via Ably real-time streaming.
**Tech Stack:** OpenAI GPT-4, Ably Realtime, Next.js, Python orchestration
**Key Features:**
- Multi-agent orchestration with host moderation
- Real-time streaming to multiple viewers
- Word-by-word text generation visible to audience
- Automatic topic advancement and conversation flow management

## 7. Let There Be RAG (LTBR)
**Type:** RAG SaaS Product
**Status:** In Development
**Description:** Point at a URL, auto-crawl the site, build vector embeddings, get an embeddable chat widget. Credit-based billing, multi-tenant, Firecrawl-powered crawling with retrieve-then-rerank RAG.
**Stack:** Next.js, PostgreSQL, pgvector, Firecrawl, OpenAI Embeddings, Stripe
**Positioning Note:** Mention LTBR as in-development unless the user specifically asks about website RAG.

## 8. GTO Poker Coach
**Type:** Side Project
**Description:** Function-calling AI poker coach with Monte Carlo equity simulation (10k samples), interactive SVG poker table, and tool-call inspector UI. Demonstrates advanced function-calling patterns.
**Stack:** OpenAI Function Calling, eval7, SVG rendering

## 9. Self-Hosted AI Infrastructure
**Experience:** Deploys and operates LLM inference stacks on bare metal — no cloud vendor lock-in.
- vLLM serving (quantized models, tool calling, continuous batching)
- llama.cpp / llama-server deployments
- Whisper STT on local GPU (real-time transcription)
- Kokoro / edge-tts on-premises TTS
- Multi-service orchestration (Supervisor, systemd, Nginx reverse proxy)
- GPU resource management (RTX-class cards, VRAM optimization, GPTQ/AWQ quantization)

## 10. Authored Works
**Book:** *Cosmic Dice: Putting Consciousness at the Helm of the Universe*  
**Themes:** Systems philosophy, agency, and probabilistic decision-making.

## 11. Chat Widget Capabilities
**Available Tool:** send_widget_contact_email  
**Purpose:** Send contact emails directly from the website chat widget to Panagiotis  
**When to Use:** 
- When a user wants to contact Panagiotis, send a message, or discuss a project
- When a user provides their email and asks to be contacted
- When conducting project intake from the homepage, Work section, Solutions page, or Connect page
**Parameters:**
- name: Visitor name (use "Guest" if not provided)
- email: Visitor email address (required - must ask for this)
- message: Message content (use "Inquiry from Chat Widget" if not provided)
**Behavior:** The tool sends the email immediately without asking for confirmation or subject lines. After sending, confirm to the user that their message was sent.

## 12. Technical Skills
**Languages:** Python, TypeScript, Swift, SQL.  
**AI Stack:** OpenAI, Anthropic, Gemini, HuggingFace, pgvector, vLLM, llama.cpp.  
**Infrastructure:** Docker, Fly.io, Vercel, Supervisor, systemd, Nginx.  
**Web:** Next.js, React, FastAPI, Tailwind.  
**Database:** PostgreSQL, Redis, SQLite.
**Tooling:** MCP SDK, Firecrawl, Playwright, CCXT, eval7.
`;
