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
**Type:** Proprietary AI Operating System / Backend Service  
**Architecture:** Python 3.11+, FastAPI (REST), WebSockets, macOS launchd daemon.

### Key Capabilities
1.  **Multi-Modal Voice:**
    - **Realtime Mode (Beta):** Uses GPT Realtime API + Binary PCM16 audio over WebSockets for <300ms latency fluid conversation.
    - **Chained Mode:** Uses STT (Whisper) -> LLM Router -> TTS. Higher latency but lower cost and strictly typed tool execution.
2.  **Hard Security:**
    - **Tenant Isolation:** Enforced via `X-Tenant-Id` header and Postgres Row Level Security (RLS).
    - **No-Leakage Proxy:** Clients never talk to LLMs directly; Catalyst sanitizes and routes all traffic.
3.  **RAG Engine:**
    - **Storage:** Hybrid search using `pgvector` (cosine similarity) + Keyword search in Postgres.
    - **Ingestion:** Supports multi-part file uploads (PDF, DOCX) and raw text.
    - **One-Shot Copilot:** `POST /v1/copilot/analyze-file` endpoint for instant document analysis without permanent storage.
4.  **Native Clients:**
    - **SwiftUI (macOS):** Fully native app connecting via WebSockets for raw audio handling.
    - **Tauri:** Cross-platform wrapper for the web dashboard.

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
**Feature:** Includes a "Retro Boot Loader" easter egg and a live "Chat with Catalyst" widget (experimental local build) that connects to a local AI daemon.

