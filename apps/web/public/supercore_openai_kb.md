# Supercore Complete Knowledge Base
## AI Solutions by Panagiotis Pilafas

---

# SECTION 1: PROFESSIONAL PROFILE

## Panagiotis Pilafas - Systems Engineer / AI Architect

**Website:** https://supercore.tech  
**Contact:** contact@supercore.tech  
**Location:** Available for remote work worldwide  

**Tagline:** "Specialized in AI-Related Ecosystems. From 6502 Assembly to Distributed Intelligent Agents."

### Engineering Philosophy

I am not a "glue code" developer—I am a systems engineer. My approach is defined by:

- **Zero-Dependency Architecture:** I build custom, lightweight orchestration engines (like Catalyst) over heavy frameworks (LangChain) to ensure deterministic control, micro-latency, and easier debugging.
- **Hard Multi-Tenancy:** Systems designed from day one to be secure and isolated (PostgreSQL RLS), not retrofitted later.
- **Cost-Aware Intelligence:** Route easy tasks to cheap models (Gemini Flash, Haiku) and hard tasks to reasoning models (GPT-4o), optimizing unit economics.
- **Stateful Services:** Persistent daemons (macOS launchd, Linux systemd) rather than stateless scripts, enabling proactive AI behavior.

### Historical Background

- **Roots:** Programming since the 1980s
- **Low-Level:** Experience with 6502 Assembly and C, deep understanding of memory management
- **Evolution:** Web revolution → Distributed systems → Generative AI infrastructure

### Technical Expertise

| Skill | Level | Status |
|-------|-------|--------|
| AI/ML Infrastructure | 5/5 | Expert |
| Distributed Systems | 4/5 | Advanced |
| RAG & Knowledge Systems | 5/5 | Expert |
| MLOps & Cloud | 4/5 | Advanced |
| Data Engineering | 4/5 | Advanced |
| Systems Architecture | 5/5 | Expert |

**Languages:** Python, TypeScript, Go, Swift, Rust, SQL, Assembly  
**AI Stack:** OpenAI, Anthropic, Gemini, HuggingFace, pgvector, Pinecone  
**Infrastructure:** Docker, Kubernetes, AWS, GCP, Vercel, Fly.io  
**Web:** Next.js, React, Tailwind  
**Database:** PostgreSQL, Redis, SQLite

---

# SECTION 2: SERVICES & SOLUTIONS

## AI Solutions for Real Business Problems

### 1. AI Website Chat
- **Problem:** Customers expect 24/7 support, but scaling human agents is expensive. Generic chatbots frustrate users.
- **Solution:** Custom AI assistant trained on your documentation and FAQs. Integrates with CRM, escalates to humans.
- **Tech Stack:** OpenAI, LangChain, Vercel AI SDK
- **ID:** ai-chat

### 2. Internal Knowledge Base (RAG)
- **Problem:** Tribal knowledge scattered across Notion, Slack, Google Drive. New hires take months to get up to speed.
- **Solution:** Unified semantic search across all company data. Natural language queries with source citations.
- **Tech Stack:** pgvector, LlamaIndex, Embeddings, SSO Integration
- **ID:** rag

### 3. AI Copilot for Your Product
- **Problem:** Competitors shipping AI features. Users demanding it. Falling behind.
- **Solution:** Embed AI capabilities directly into your SaaS. Smart suggestions to natural language interfaces.
- **Tech Stack:** OpenAI API, Custom Fine-tuning, Product API
- **ID:** copilot

### 4. Voice AI / Call Automation
- **Problem:** Call center costs exploding. Hold times frustrate customers. After-hours coverage expensive.
- **Solution:** Voice agents with sub-300ms latency. Human-like conversation with seamless escalation.
- **Tech Stack:** Twilio, Deepgram, ElevenLabs, Custom Orchestration
- **ID:** voice

### 5. Document Processing
- **Problem:** Manual extraction from PDFs, invoices, contracts. Hours of repetitive data entry.
- **Solution:** Automated parsing, validation, structured data export. Confidence scoring for edge cases.
- **Tech Stack:** OCR, GPT-4 Vision, Structured Output, Database Sync
- **ID:** documents

### 6. AI Workflow Agents
- **Problem:** Repetitive multi-step tasks consuming human hours. Error-prone manual processes.
- **Solution:** Autonomous agents that execute, verify, report. Human-in-the-loop gates for critical decisions.
- **Tech Stack:** LangGraph, Tool Orchestration, Safety Gates
- **ID:** agents

### 7. Content Generation Pipeline
- **Problem:** Content bottleneck. Marketing can't keep up. Scaling means scaling headcount.
- **Solution:** Brand-trained generation with editorial workflow. Consistent voice, human review, bulk production.
- **Tech Stack:** Fine-tuned Models, Style Guides, Review Workflow
- **ID:** content

### 8. Custom LLM Training
- **Problem:** Generic models don't understand your domain, jargon, proprietary processes.
- **Solution:** Fine-tuned or RAG-augmented models on your data. Private hosting for sensitive industries.
- **Tech Stack:** OpenAI Fine-tuning, LoRA, Private Hosting
- **ID:** training

---

# SECTION 3: WORK PROCESS

## How I Work

### 1. Discovery
Define scope, constraints, and success metrics together.

### 2. Build
Iterative development with weekly demos and feedback loops.

### 3. Ship
Production deployment with documentation and support handoff.

---

# SECTION 4: FLAGSHIP PROJECT - CATALYST AI

## Catalyst AI: Multi-Tenant Runtime Platform

**Type:** Production-Ready Multi-Tenant AI Assistant Platform  
**Status:** Fully operational in production  
**Architecture:** Python 3.11+, FastAPI (REST), WebSockets, PostgreSQL + pgvector  

### Deployment
- **Backend:** Fly.io (https://catalyst-service.fly.dev/v1)
- **Frontend:** Vercel (catalyst-chat.supercore.tech, catalyst-dashboard.supercore.tech)
- **Database:** Fly.io Managed PostgreSQL with pgvector

### Key Capabilities

#### 1. Multi-Modal Voice
- **Realtime Mode:** GPT Realtime API + PCM16 over WebSockets, <300ms latency
- **Chained Mode:** Whisper → LLM Router → TTS for cost-efficient structured tasks
- **VAD and PTT:** Voice Activity Detection and Push-to-Talk modes

#### 2. Hard Multi-Tenancy
- **API Key Authentication:** Tenant binding with strict isolation
- **Database-Level Isolation:** PostgreSQL Row Level Security (RLS)
- **Per-Tenant Policies:** Rate limits, logging, encryption scoped per tenant
- **No-Leakage Proxy:** Clients never talk to LLMs directly

#### 3. Advanced RAG Engine
- **Vector Search:** PostgreSQL with pgvector for cosine similarity
- **Hybrid Search:** Vector similarity + keyword matching
- **Multiple Vector Stores:** Per-tenant knowledge bases
- **Encrypted Storage:** Optional AES-256-GCM for files
- **File Support:** PDF, DOCX, TXT with server-side extraction
- **Namespace Scoping:** Organize by case/matter/project
- **One-Shot Copilot:** `/v1/copilot/analyze-file` for instant analysis

#### 4. Integrated Tools & Services
- **Google Integration:** Gmail, Calendar, Drive (OAuth 2.0)
- **Web Search:** Real-time information retrieval
- **SQL Tools:** Read-only queries with allowlisting
- **Structured Extraction:** Legal documents, deadlines, workflows

#### 5. Enterprise Features
- User Management with role-based access
- Token allowances for test users
- Audit logging and observability
- Per-tenant LLM routing
- Proactive messaging
- Background data fetching
- Session management with auto-summarization
- Token tracking and analytics

#### 6. Native Clients
- **SwiftUI (macOS):** Raw audio handling via WebSockets
- **Tauri:** Cross-platform dashboard wrapper
- **Next.js Dashboard:** Modern UI replacing Streamlit

### Key Metrics
- **<300ms** Voice Latency
- **100%** Data Isolation
- **RLS** Row Level Security
- **99.9%** Uptime

---

# SECTION 5: CASE STUDY - π.LAW (Pi.Law)

## π.Law: Enterprise Legal AI CRM

**Type:** Enterprise Legal AI CRM  
**Status:** Production Case Study  
**Stack:** Next.js 16, Tailwind, FastAPI Proxy, Catalyst Core, Postgres (pgvector)

### The Problem
Legal data is highly sensitive. Standard "Chat with PDF" wrappers are not secure enough for law firms.

### The Solution

#### Zero-Leakage Architecture
- Frontend (Next.js) has no direct access to AI or Database
- Talks to FastAPI Proxy which injects X-Tenant-Id and strips PII
- Proxy forwards to Catalyst Core

#### Hybrid Search
- **pgvector** for semantic understanding ("Find cases about negligence")
- **Keyword search** for citation lookup ("Find case 12-345")

### Technical Implementation

**Hybrid Retrieval Pipeline:**
```
Query → [Vector Search] → Top 100 candidates
      → [BM25 Search]   → Top 100 candidates
      → [Reranker]      → Final 20 results
```

**Structured Metadata:**
- Court level (Supreme, Appeal, First Instance)
- Legal domain (Civil, Criminal, Administrative)
- Key legal principles cited
- Date and jurisdiction

**Citation Verification:**
Every case is verified in the source database before display. Hallucinated cases are flagged clearly.

### Why RAG Alone Fails for Legal

- **Chunk boundaries break context** - Legal principles span multiple paragraphs
- **Relevance ≠ Similarity** - Counter-examples are relevant but not similar
- **Authority matters** - Supreme Court overrules lower courts

### Lessons Learned

1. **Work with Domain Experts Early** - Partnered with practicing lawyers from day one
2. **Build for Trust, Not Wow** - Always show sources, confidence indicators, audit trails
3. **Integrate with Existing Workflows** - Enhance rather than replace

---

# SECTION 6: SILICON SMACKDOWN PROJECT

## Silicon Smackdown: Voice AI Talk Show Platform

**URL:** https://ssd.supercore.tech  
**GitHub:** https://github.com/ppilafas/silicon_smackdown  
**Password:** 1999  
**Built for:** Google Gemini Developer Competition

### What It Is
Real-time AI talk show where legendary personalities engage in voice debates. Full-duplex audio, 20+ character pairs, powered by Gemini Live API.

### Technical Highlights

#### Full-Duplex Voice AI
- Gemini 2.5 Flash with native audio streaming
- **<100ms audio latency** using AudioWorklet
- Voice-to-voice AI (no TTS intermediaries)
- Live waveform visualization

#### 20+ AI Personalities
Curated character pairs:
- Dr. Orion vs Luna Nova (Philosophy vs Futurism)
- Sherlock vs Moriarty (Detective & Mastermind)
- Tony Stark vs Peter Parker (Mentor vs Protégé)
- Master Yoda vs Luke Skywalker (Jedi wisdom)
- Einstein vs Niels Bohr (Physics debate)
- Walter White vs Jesse Pinkman (Breaking Bad)

#### Multi-Agent Orchestration
- Sophisticated state machine managing dual AI sessions
- Automatic turn-taking and context-aware prompting
- Custom React hooks for modular state management

#### Production Audio Pipeline
- Web Audio API + AudioWorklet architecture
- ScriptProcessor fallback for browser compatibility
- Real-time waveform analysis
- Dual-channel audio routing

### Architecture Stats
- **<100ms** Audio Latency
- **1-3s** AI Response Time
- **50-100MB** Memory Footprint

### Tech Stack
- React 19 with concurrent features
- TypeScript for type safety
- Gemini 2.5 Live API
- Web Audio API with AudioWorklet
- Tailwind CSS
- Vite build tool
- i18next (EN/EL)
- DiceBear avatars

### What Worked
1. Custom Hook Architecture - Separated concerns, maintainable
2. AudioWorklet - Reduced latency from ~200ms to <100ms
3. Typed State Machine - Prevented state bugs
4. Fallback Mechanisms - Auto-reconnection across browsers

### Challenges Overcome
- **Turn-Taking:** State machine solved guests talking over each other
- **Context Loss:** Maintained conversation history across turns
- **Audio Echo:** Headphone detection and routing isolation
- **Memory Leaks:** Proper cleanup in useEffect hooks

---

# SECTION 7: ARTICLES & INSIGHTS

## Building Catalyst: Lessons from a Production AI Platform

**Date:** January 10, 2025  
**Category:** Project Case Study  
**Tags:** catalyst, production, architecture, multi-tenant

### The Problem Catalyst Solves

Most AI integrations follow a pattern:
1. Developer gets excited about ChatGPT
2. Adds OpenAI API call to their app
3. App works in demo
4. App fails in production (rate limits, latency, costs, security)
5. Developer spends 6 months building infrastructure

Catalyst is that infrastructure, pre-built.

### Architecture Decisions

**1. Streaming-First Design**
Every AI response streams by default. Essential for UX—nobody wants to stare at a spinner for 30 seconds.

**2. Tenant Isolation Without Performance Penalty**
Single deployment with tenant context passed through every layer. Separate API keys, usage tracking, rate limiting, data isolation.

**3. Tool Calling as First-Class Citizen**
Agentic AI requires: schema validation, permission checking, audit logging, graceful failure handling.

### Problems Nobody Warns You About

**Token Estimation is a Lie**
Built a token budget system that reserves headroom for responses.

**Latency Variance is Wild**
Same prompt: 2 seconds or 20 seconds. Implemented:
- Aggressive timeouts with automatic retry
- Request queuing with priority levels
- Fallback to smaller models when latency spikes

**Observability is Non-Negotiable**
Log everything: every request, response, token count, tenant affected, model used.

### What I'd Do Differently
- **Start with rate limiting** - Added late, had to retrofit
- **Invest in local development earlier** - Built mock LLM server eventually
- **Design for model switching** - Models change fast (Claude 3.5, GPT-4o)

### Result
Catalyst now powers multiple production applications. Thousands of requests daily with 99.9% uptime.

---

## π.Law: How AI is Transforming Legal Research

**Date:** January 5, 2025  
**Category:** Project Case Study  
**Tags:** legal-tech, rag, enterprise, domain-specific

### The Challenge

Legal research is stuck in the 1990s. Lawyers spend hours searching case law with keyword searches, reading irrelevant results.

π.Law is an AI-powered legal research platform built specifically for the Greek legal system.

### Why Legal is Different

**1. Precision is Non-Negotiable**
When a lawyer cites a case, it needs to be real. Hallucinated citations = malpractice.

**2. Corpus is Massive and Structured**
Millions of documents with specific structure (parties, court, date, legal principles). Throwing away structure wastes information.

**3. Language Complexity**
Legal Greek is archaic, sentence structure complex. General-purpose embeddings struggle.

### The Architecture

**Hybrid Retrieval:**
- Vector search catches semantic similarity ("tenant eviction rights")
- Keyword search catches exact matches ("Article 574 Civil Code")
- Reranker combines intelligently

**Structured Metadata:**
- Court level, legal domain, key principles, date, jurisdiction
- Enables filtering: "Supreme Court decisions last 5 years about data protection"

**Citation Verification:**
Every case verified in source database before display. No silent hallucinations.

### Why RAG Alone Fails for Legal

- **Chunk boundaries break context** - Principles span paragraphs
- **Relevance ≠ Similarity** - Counter-examples relevant but not similar
- **Authority matters** - Supreme Court overrules lower courts

### Lessons

1. **Work with Domain Experts Early** - Practicing lawyers caught fatal assumptions
2. **Build for Trust, Not Wow** - Show sources, confidence, audit trails
3. **Integrate with Existing Workflows** - Enhance, don't replace

---

# SECTION 8: GENERAL AI INSIGHTS

## Demo to Production: Why AI Projects Fail

The gap between "it works" and "it's in production" is where most AI projects die.

### Common Failure Modes

**1. Underestimating Infrastructure**
The AI is 10% of the work. The other 90%: auth, rate limiting, error handling, monitoring, cost controls.

**2. Ignoring Latency**
Users expect sub-second responses. LLMs take 2-20 seconds. Streaming, caching, and fallback strategies are essential.

**3. No Cost Controls**
OpenAI bills by the token. Without budgets and alerts, a single runaway conversation can cost hundreds.

**4. Poor Error Handling**
LLM APIs fail. Networks fail. Your system needs graceful degradation, not crashes.

**5. No Observability**
When something breaks (and it will), you need to know what prompt was sent, what model was used, what came back.

### The Path to Production

1. Start with a real use case, not a demo
2. Design for failure from day one
3. Build observability in, not on
4. Set hard cost boundaries
5. Test with real users early

---

## RAG in Production: Why Implementations Fail

Retrieval-Augmented Generation is simple in concept, hard in production.

### Failure Patterns

**1. Poor Chunking Strategy**
- Arbitrary chunk sizes lose context
- No overlap misses connecting information
- Metadata not preserved

**2. Bad Embedding Model Choice**
- Using general-purpose embeddings for domain text
- Not fine-tuning for your vocabulary
- Ignoring multi-language needs

**3. Weak Retrieval**
- Pure vector similarity misses exact matches
- No hybrid search (vector + keyword)
- No reranking

**4. Context Window Mismanagement**
- Stuffing too many chunks into context
- No prioritization of retrieved content
- Not handling "not found" cases

**5. No Evaluation Framework**
- Can't measure retrieval quality
- No feedback loop for improvement
- Flying blind on production performance

### What Works

1. **Smart Chunking** - Semantic boundaries, overlap, rich metadata
2. **Hybrid Retrieval** - Vector + BM25 + reranker
3. **Context Budgeting** - Reserve tokens for response, prioritize chunks
4. **Continuous Evaluation** - Measure relevance, iterate on retrieval

---

## Voice Agents: Reality vs Hype

Voice AI is the new chatbot. Everyone wants it; few understand the complexity.

### The Hype
"Just add a voice interface to your chatbot!"

### The Reality

**Latency is Critical**
- 300ms is the magic threshold
- >500ms feels broken
- Every layer adds latency: STT → LLM → TTS

**Full-Duplex is Hard**
- Interrupting the AI gracefully
- Handling barge-in during TTS
- Maintaining conversation context

**Audio is Messy**
- Background noise
- Accents and speech patterns
- Network quality variations
- Echo and feedback loops

### Production Considerations

**1. Choose Your Architecture**
- **Chained:** STT → LLM → TTS (higher latency, lower cost)
- **Native:** End-to-end voice model (lower latency, higher cost)

**2. Handle the Edge Cases**
- Connection drops and reconnections
- Partial audio chunks
- User silence detection
- Audio format conversions

**3. Monitor What Matters**
- End-to-end latency per turn
- ASR accuracy
- Intent classification rate
- User satisfaction (did they complete the task?)

### When to Use Voice

✅ **Good fit:** Hands-busy scenarios, accessibility, quick queries  
❌ **Poor fit:** Complex data entry, visual content, long-form research

---

## Will AI Replace Developers?

Short answer: No. But it will change what developers do.

### What AI is Good At

- Boilerplate and scaffolding
- Refactoring and migrations
- Explaining unfamiliar code
- Generating test cases
- Documentation

### What AI is Bad At

- System architecture decisions
- Understanding business context
- Debugging complex production issues
- Security and edge case thinking
- Long-term maintenance planning

### The Shift

**From:** Writing lines of code  
**To:** Orchestrating AI systems, reviewing AI output, architecture decisions

**From:** Syntax expertise  
**To:** Domain expertise + systems thinking

**From:** Individual contributors  
**To:** AI-augmented teams

### What Developers Should Learn

1. **How to work with AI** - Prompt engineering, output validation, error handling
2. **Systems thinking** - Architecture, trade-offs, integration
3. **Domain expertise** - The AI knows syntax; you know the business
4. **Verification** - Always review AI output, never blindly trust

### The Future

The best developers will be those who can:
- Break complex problems into AI-solvable chunks
- Validate and integrate AI output
- Architect systems that combine human and AI capabilities

AI is a tool, not a replacement. The developers who thrive will be those who learn to wield it effectively.

---

# SECTION 9: CONTACT & ENGAGEMENT

## How to Contact Panagiotis

**Email:** contact@supercore.tech  
**Website:** https://supercore.tech  

### Engagement Options

**Chat Widget:** Available on all pages - Catalyst AI assistant for immediate questions

**Project Inquiry:** Click "Start This Project" on any solution card to begin structured intake

**Direct Contact:** Visit /connect page for contact form

### What to Expect

**Response Time:** Typically within 24 hours  
**Discovery Call:** Free 30-minute consultation to discuss your project  
**Proposal:** Detailed scope, timeline, and pricing within 3-5 business days after discovery

### Project Intake Process

When you express interest in a solution, the AI assistant will collect:
1. **Timeframe** - When do you need this live? (2 weeks, 1 month, 3 months, flexible)
2. **Budget** - What's your budget range? ($5K-10K, $10K-25K, $25K+, not sure yet)
3. **Email** - Best email to reach you
4. **Details** - Any specific requirements or constraints

Once email is provided, a summary is sent immediately to Panagiotis for follow-up.

---

# SECTION 10: ADDITIONAL RESOURCES

## Website Sections

- **Home (/)** - Overview, hero section, featured work
- **Solutions (/solutions)** - 8 AI solution offerings
- **Articles (/articles)** - Technical insights and case studies
- **Catalyst AI (/catalyst-ai)** - Platform details and dashboard access
- **Silicon Smackdown (/silicon-smackdown)** - Voice AI talk show project
- **π.Law (/pilaw)** - Legal AI case study
- **Technical Expertise (/technical-expertise)** - Skills and experience
- **Authored Works (/authored-works)** - Book and publications
- **Connect (/connect)** - Contact form and information

## GitHub Projects

- **Silicon Smackdown:** https://github.com/ppilafas/silicon_smackdown
- **Catalyst:** (Private/Enterprise)

## External Links

- **Silicon Smackdown Demo:** https://ssd.supercore.tech (Password: 1999)
- **Catalyst Dashboard:** https://catalyst-dashboard.supercore.tech
- **Catalyst Chat:** https://catalyst-chat.supercore.tech

---

# END OF KNOWLEDGE BASE

*This knowledge base contains all publicly available information about Supercore, Panagiotis Pilafas, Catalyst AI platform, π.Law, Silicon Smackdown, and related AI services. Last updated: February 2026.*
