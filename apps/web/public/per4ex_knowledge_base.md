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

---

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
    - **Realtime Mode (Beta):** Uses GPT Realtime API + Binary PCM16 audio over WebSockets for <300ms latency fluid conversation.
    - **Chained Mode:** Uses STT (Whisper) -> LLM Router -> TTS. Higher latency but lower cost and strictly typed tool execution.
    - Voice Activity Detection (VAD) and Push-to-Talk (PTT) modes

2.  **Hard Multi-Tenancy:**
    - **API Key Authentication:** Tenant binding with strict isolation
    - **Database-Level Isolation:** PostgreSQL Row Level Security (RLS)
    - **Per-Tenant Policies:** Rate limits, logging, encryption scoped per tenant
    - **No-Leakage Proxy:** Clients never talk to LLMs directly; Catalyst sanitizes and routes all traffic

3.  **Advanced RAG Engine:**
    - **Vector Search:** PostgreSQL with pgvector extension for cosine similarity
    - **Hybrid Search:** Combines vector similarity + keyword matching
    - **Multiple Vector Stores:** Per-tenant support for multiple knowledge bases
    - **Encrypted Storage:** Optional AES-256-GCM encryption for files and content
    - **File Support:** PDF, DOCX, TXT with server-side extraction
    - **Namespace Scoping:** Organize content by case/matter/project within tenants
    - **OpenAI Integration:** Optional OpenAI file_search vector stores
    - **One-Shot Copilot:** `POST /v1/copilot/analyze-file` endpoint for instant document analysis without permanent storage

4.  **Integrated Tools & Services:**
    - **Google Integration:** Gmail, Calendar, Drive (with explicit user consent and OAuth 2.0)
    - **Web Search:** Real-time information retrieval
    - **SQL Tools:** Read-only database queries with allowlisting
    - **Structured Extraction:** Legal document metadata, deadlines, automation workflows

5.  **Enterprise Features:**
    - **User Management:** Role-based access control
    - **Token Allowances:** System for test users and usage limits
    - **Audit Logging:** Comprehensive observability and compliance
    - **Per-Tenant LLM Routing:** Server-side model selection and cost optimization
    - **Proactive Messaging:** Context-aware proactive suggestions
    - **Background Data Fetching:** Gmail, news, calendar integration
    - **Session Management:** Automatic conversation summarization
    - **Token Tracking:** Per-turn analytics and usage monitoring

6.  **Native Clients:**
    - **SwiftUI (macOS):** Fully native app connecting via WebSockets for raw audio handling with zero-latency overhead
    - **Tauri:** Cross-platform wrapper for the web dashboard
    - **Next.js Dashboard:** Modern dashboard replacing legacy Streamlit UI

---

## 3. Flagship Project: π.Law (Pi.Law)
**Type:** Enterprise Legal AI CRM  
**Status:** Production Case Study  
**Stack:** Next.js 16, Tailwind, FastAPI Proxy, Catalyst Core, Postgres (pgvector).

### The Problem Solved
Legal data is highly sensitive. Standard "Chat with PDF" wrappers are not secure enough for law firms.

### The Solution
- **Zero-Leakage Architecture:** The frontend (Next.js) has no direct access to the AI or Database. It talks to a FastAPI Proxy.
- **The Proxy:** Injects the `X-Tenant-Id`, validates sessions, and strips PII before forwarding requests to the Catalyst Core.
- **Hybrid Search:** Uses pgvector for semantic understanding ("Find cases about negligence") and keyword search for citation lookup ("Find case 12-345").

---

## 4. Authored Works
**Book:** *Cosmic Dice: Putting Consciousness at the Helm of the Universe*  
**Themes:** Systems philosophy, agency, and probabilistic decision-making in humans and AI.  
**Relevance:** The book's theories on "Willed Randomness" and "Constrained Agency" directly influenced the architecture of the Catalyst AI Agent—treating it as a probabilistic system operating within strict constraints (Tools/RLS).

---

## 5. Technical Skills
**Languages:** Python, TypeScript, Go, Swift, Rust, SQL, Assembly (Legacy).  
**AI Stack:** OpenAI API, Anthropic, Gemini, HuggingFace Inference, LangChain (Known but avoided), LlamaIndex, pgvector, Pinecone.  
**Infrastructure:** Docker, Kubernetes, AWS, GCP, Vercel, Render, Railway.  
**Web:** Next.js (App Router), React, Tailwind CSS, Framer Motion.  
**Database:** PostgreSQL (Expert), Redis, SQLite.

---

## 6. This Portfolio (Per4ex.org)
**Built With:** Next.js 16, Tailwind CSS, Framer Motion.  
**Hosted On:** Vercel.  
**Feature:** Includes a "Retro Boot Loader" easter egg and a live "Chat with Catalyst" widget that connects to the production Catalyst API (https://catalyst-service.fly.dev/v1).

