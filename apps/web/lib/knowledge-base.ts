/**
 * Knowledge Base Context for Per4ex.org
 * This context is injected into chat messages to provide the AI with information
 * about Panagiotis Pilafas and his work.
 */

export const KNOWLEDGE_BASE_CONTEXT = `
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
**Type:** Production-Ready Multi-Tenant AI Assistant Platform  
**Status:** Fully operational in production  
**Architecture:** Python 3.11+, FastAPI (REST), WebSockets, PostgreSQL + pgvector  
**Deployment:** 
- Backend: Fly.io (https://catalyst-service.fly.dev/v1)
- Frontend: Vercel (catalyst-chat.per4ex.org, catalyst-dashboard.per4ex.org)
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

5.  **Enterprise Features:**
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

