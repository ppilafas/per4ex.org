import { cn } from "@/lib/utils"
import Image from "next/image"
import { Search, Database, Brain, Mic, Shield, FileText, Network, Clock, Zap, Terminal, Server, Eye, Layers, GitBranch, AudioLines, ScrollText, Lock, ChevronRight, Activity } from "lucide-react"

export const metadata = {
  title: "Forensic AI Studio | supercore.tech",
  description: "A private AI investigator built from scratch: ingests evidence, maps entity relationships, analyzes audio recordings, and reasons across 100K+ documents in real-time.",
}

export default function ForensicsPage() {
  return (
    <div className="space-y-0">

      {/* ── Hero ── */}
      <div className="relative py-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 hero-grid -z-10 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative w-36 h-36 drop-shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform duration-500">
              <Image
                src="/detective.png"
                alt="Forensic AI Studio"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-widest border border-accent/20 mb-8 uppercase">
            <Lock className="w-3 h-3" />
            Private Tool · Not a Product
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight leading-none">
            Forensic AI<br />
            <span className="text-accent">Studio</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            I built a private AI investigator for a real legal case. It ingests evidence, maps entity relationships, analyzes audio recordings, and reasons across <strong className="text-foreground">100K+ documents</strong> in real-time.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "155", label: "TypeScript files" },
              { value: "45", label: "API routes" },
              { value: "28+", label: "Agent tools" },
              { value: "25", label: "DB tables" },
            ].map((s) => (
              <div key={s.label} className="glass-panel py-4 px-3 text-center">
                <div className="text-3xl font-bold text-accent mb-1">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What it is ── */}
      <div className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">What Is This?</h2>
          <div className="glass-panel border-l-4 border-l-accent mb-10">
            <p className="text-lg text-muted leading-relaxed">
              This is a <strong className="text-foreground">full-stack AI investigation platform</strong> I built for personal use during a complex legal case. It's not a product, not a demo — it's a working tool I use daily. The codebase is a Next.js 16 app with a PostgreSQL + pgvector backend, a 28-tool AI agent layer, a voice interface, and a deep research orchestrator. Everything is purpose-built for one job: <strong className="text-foreground">finding the truth in a mountain of evidence.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Evidence Ingestion",
                desc: "Parses PDF, DOCX, ODT, EML, HTML, CSV, WhatsApp SQLite DBs, and audio/video files. Chunks, embeds, and extracts named entities automatically.",
              },
              {
                icon: Brain,
                title: "AI Agent with 28+ Tools",
                desc: "A persistent agent that can search evidence, recall memories, run deep research, analyze audio, query Gmail/Drive, browse the web, and execute multi-step investigations.",
              },
              {
                icon: AudioLines,
                title: "Audio Intelligence",
                desc: "Sends audio recordings to Gemini's audio modality (50–80K tokens per file). Extracts transcripts, speaker labels, entities, and forensic findings. Results cached to avoid re-spending tokens.",
              },
            ].map((f) => (
              <div key={f.title} className="glass-panel hover:border-accent/40 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Capability Map ── */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3 text-center">Capability Map</h2>
          <p className="text-muted text-center mb-12 max-w-2xl mx-auto">Every module is production-quality, purpose-built, and wired together into a single coherent system.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <CapabilityCard
              icon={Search}
              title="Evidence Browser"
              badge="DONE"
              items={[
                "Search + filter 169 ingested documents",
                "Chunk viewer with source attribution",
                "Inline ingestion panel",
                "pgvector semantic search + GIN full-text",
              ]}
            />

            <CapabilityCard
              icon={Network}
              title="Entity Graph"
              badge="DONE"
              items={[
                "d3-force relationship visualization",
                "8 entity types (people, companies, …)",
                "Greek + English NER via Gemini Flash",
                "Entity CRM with profile editor",
              ]}
            />

            <CapabilityCard
              icon={AudioLines}
              title="Media Lab"
              badge="DONE"
              items={[
                "Waveform viewer + transport bar",
                "Gemini audio modality analysis",
                "Speaker diarization + labeling",
                "Checkpoint cache (no re-spend)",
              ]}
            />

            <CapabilityCard
              icon={GitBranch}
              title="Deep Research"
              badge="DONE"
              items={[
                "5-phase orchestrator: Plan → Gather → Synthesize → Iterate → Report",
                "Tavily web search + local evidence",
                "Gmail / Drive integration",
                "Gemini Deep Research (optional)",
              ]}
            />

            <CapabilityCard
              icon={Brain}
              title="Vector Memory"
              badge="DONE"
              items={[
                "Semantic dedup (cosine > 0.85 → merge)",
                "5 categories: entity, fact, decision, preference, focus",
                "Sub-millisecond in-memory search",
                "Lightweight context hint (~50 tokens)",
              ]}
            />

            <CapabilityCard
              icon={Layers}
              title="Context Manager"
              badge="DONE"
              items={[
                "Budget-aware layered context",
                "Dynamic turn window (4–20 turns)",
                "Gemini explicit cache (75% cost reduction)",
                "Handles 1M → 128K model switches",
              ]}
            />

            <CapabilityCard
              icon={Shield}
              title="Integrity & Tamper"
              badge="PARTIAL"
              items={[
                "SHA-256 hash verification per document",
                "Integrity checks table + trust scores",
                "Immutable audit log",
                "Audio spectral analysis (planned)",
              ]}
            />

            <CapabilityCard
              icon={Clock}
              title="Timeline"
              badge="DONE"
              items={[
                "Normalized event timeline",
                "Cross-referenced with entities",
                "Filterable by event type",
                "Auto-population from ingested data (planned)",
              ]}
            />

            <CapabilityCard
              icon={Mic}
              title="Voice Interface"
              badge="DONE"
              items={[
                "Whisper STT",
                "ElevenLabs TTS (sentence-level streaming)",
                "Gemini TTS (free tier fallback)",
                "Voice settings: provider, model, voice, mode",
              ]}
            />

          </div>
        </div>
      </div>

      {/* ── Agent Tools ── */}
      <div className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3">The Agent's Toolbox</h2>
          <p className="text-muted mb-10 max-w-2xl">28+ tools across 7 categories. The agent decides which to call, in what order, and how to chain results.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <ToolGroup title="Memory" icon={Brain} tools={[
              ["recall_memory", "Semantic search over stored memories"],
              ["save_memory", "Explicitly store a fact or preference"],
              ["manage_memory", "Delete / edit / prune memory store"],
            ]} />

            <ToolGroup title="Knowledge & Investigation" icon={Search} tools={[
              ["fast_context", "Parallel semantic + FTS + metadata search"],
              ["investigate", "Cross-reference multiple sources"],
              ["create_investigation", "Multi-step research plan"],
            ]} />

            <ToolGroup title="Deep Research" icon={ScrollText} tools={[
              ["deep_research", "Launch 5-phase background research task"],
              ["check_research", "Poll task status"],
              ["followup_research", "Cheap follow-up on Gemini DR results"],
            ]} />

            <ToolGroup title="Google Workspace" icon={Zap} tools={[
              ["search_gmail / read_gmail / send_gmail", "Full Gmail access"],
              ["search_drive / read_drive_file", "Google Drive"],
              ["list_calendar_events", "Calendar"],
              ["search_contacts", "Contacts"],
            ]} />

            <ToolGroup title="Audio Intelligence" icon={AudioLines} tools={[
              ["analyze_audio", "Gemini audio modality — listen + analyze"],
              ["get_analysis", "Retrieve cached analysis results"],
            ]} />

            <ToolGroup title="Self-Inspection" icon={Eye} tools={[
              ["check_app_state", "App activity snapshot"],
              ["read_traces", "Inspect own behavior logs"],
              ["adjust_persona", "Propose behavioral change"],
              ["send_to_inbox / read_inbox", "Message IDE agent (Cascade)"],
            ]} />

          </div>
        </div>
      </div>

      {/* ── Architecture ── */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">System Architecture</h2>

          <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Server className="w-64 h-64 text-accent" />
            </div>
            <div className="relative z-10">
              <div className="bg-[#111] rounded-lg p-6 font-mono text-xs border border-card-border overflow-x-auto">
                <pre className="text-muted">{`
User Message
    │
    ▼
context-manager.ts  ──── Budget-aware layered context
    │                    ┌─ Compass (90K, Gemini cache)
    │                    ├─ Persona (~820 tokens)
    │                    ├─ Memory Hint (~50 tokens)
    │                    ├─ Session Summary (~300 tokens)
    │                    └─ Recent Turns (4–20, dynamic)
    │
    ▼
AI SDK streamText()  ──── Multi-model: Gemini / Claude / GPT
    │
    ├── Tool Calls ──────► 28+ tools execute in parallel
    │       │
    │       ├── fast_context    → pgvector + FTS search
    │       ├── analyze_audio   → Gemini audio modality
    │       ├── deep_research   → 5-phase orchestrator
    │       ├── search_gmail    → Google OAuth
    │       └── recall_memory   → in-memory cosine search
    │
    ▼
Assistant Response
    │
    ▼
memory-extractor.ts  ──── Async: extract + store memories
    │
    ▼
memory_vectors (PG)  ──── HNSW indexed, semantic dedup
`}</pre>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Database, title: "Database", lines: ["PostgreSQL + pgvector", "25 tables", "HNSW vector indexes", "GIN full-text indexes"] },
              { icon: Brain, title: "AI Models", lines: ["Gemini 2.0 Flash (primary)", "Claude 3.5 Sonnet", "GPT-4o", "OpenAI embeddings (1536d)"] },
              { icon: Server, title: "Stack", lines: ["Next.js 16 App Router", "Vercel AI SDK 6", "Drizzle ORM", "Google Cloud Storage"] },
            ].map((c) => (
              <div key={c.title} className="glass-panel hover:border-accent/40 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <c.icon className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-foreground">{c.title}</h3>
                </div>
                <ul className="space-y-2">
                  {c.lines.map((l) => (
                    <li key={l} className="flex items-center gap-2 text-sm text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key Engineering Decisions ── */}
      <div className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Key Engineering Decisions</h2>

          <div className="space-y-6">
            {[
              {
                problem: "Flat memory tables capped out and dumped entirely into context window",
                solution: "Vector-backed memory: each memory is a separate row with its own embedding. Semantic dedup (cosine > 0.85 → merge). Context gets a 50-token hint instead of a 1,200-token dump.",
                impact: "96% context reduction for memory layer",
              },
              {
                problem: "Fixed turn windows (e.g. 'last 20 turns') broke on model switches from 1M → 128K tokens",
                solution: "Budget-aware dynamic allocation: 30% reserved for reasoning, 15% for tool results, 55% for context. Turn window binary-searches for max turns that fit remaining budget.",
                impact: "Seamless model switching without context overflow",
              },
              {
                problem: "Implicit Gemini caching didn't guarantee cache hits, wasting tokens on the 90K compass document",
                solution: "Explicit Gemini cache API: uploads compass + persona + tools once, references by name on subsequent requests.",
                impact: "75% token cost reduction per request",
              },
              {
                problem: "Re-analyzing the same audio file burned 50–80K tokens every time",
                solution: "document_analyses table tracks completed analyses. analyze_audio checks cache before spending tokens. First analysis: 30–60s. Subsequent: 100ms.",
                impact: "Effectively free repeated audio queries",
              },
              {
                problem: "Custom message converter stripped tool invocations from history, causing models to 'forget' their tools",
                solution: "Use AI SDK's convertToModelMessages which preserves all parts: tool-call, tool-result, reasoning, file parts.",
                impact: "Reliable multi-turn tool use across all models",
              },
            ].map((d, i) => (
              <div key={i} className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-start">
                  <div>
                    <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Problem</div>
                    <p className="text-sm text-muted leading-relaxed">{d.problem}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Solution</div>
                    <p className="text-sm text-muted leading-relaxed">{d.solution}</p>
                  </div>
                  <div className="md:text-right">
                    <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Impact</div>
                    <span className="inline-block bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-semibold">{d.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Performance ── */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Performance Characteristics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { op: "Memory search", latency: "<1ms", note: "In-memory cosine similarity" },
              { op: "Embedding cache hit", latency: "0ms", note: "LRU cache, 5-min TTL" },
              { op: "Context build", latency: "10–50ms", note: "Depends on turn count" },
              { op: "Session summarization", latency: "500–1500ms", note: "Gemini Flash, every 10 turns" },
              { op: "Audio analysis (cached)", latency: "100ms", note: "DB lookup only" },
              { op: "Audio analysis (first run)", latency: "30–60s", note: "50–80K audio tokens" },
              { op: "Deep research (quick)", latency: "15–30s", note: "Depth 1" },
              { op: "Deep research (full)", latency: "3–5 min", note: "Depth 3 + Gemini DR" },
            ].map((p) => (
              <div key={p.op} className="flex items-center justify-between p-4 bg-card/30 rounded-lg border border-card-border hover:border-accent/30 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.op}</div>
                  <div className="text-xs text-muted mt-0.5">{p.note}</div>
                </div>
                <div className="text-accent font-mono font-bold text-sm ml-4 flex-shrink-0">{p.latency}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why it matters ── */}
      <div className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Build This?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="glass-panel border-l-4 border-l-accent">
              <Activity className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">Real Stakes, Real Data</h3>
              <p className="text-muted leading-relaxed">
                This wasn't built to impress anyone. It was built because I needed it. The evidence was real, the legal case was real, and the existing tools weren't good enough. Building under real constraints produces better engineering than building for demos.
              </p>
            </div>
            <div className="glass-panel border-l-4 border-l-accent">
              <Terminal className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">Proof of Depth</h3>
              <p className="text-muted leading-relaxed">
                When I say I build production AI systems, this is what I mean. Not a chatbot wrapper. A full-stack AI platform with a custom context manager, vector memory, audio intelligence, deep research orchestrator, and 28 agent tools — all wired together and actually used.
              </p>
            </div>
          </div>

          <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Brain className="w-64 h-64 text-accent" />
            </div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">The Hardest AI Problems Are Personal</h3>
              <p className="text-lg text-muted leading-relaxed">
                Reasoning across 100K+ documents, detecting tampered audio, mapping entity relationships across years of evidence — these are the same problems enterprises pay millions to solve. I built the solution for myself first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">Full Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Next.js 16", "TypeScript", "Vercel AI SDK 6",
              "PostgreSQL", "pgvector", "Drizzle ORM",
              "Google Gemini 2.0", "Anthropic Claude", "OpenAI GPT-4o",
              "Whisper STT", "ElevenLabs TTS", "Gemini TTS",
              "Google Cloud Storage", "NextAuth.js", "Google OAuth",
              "Tavily Search", "d3-force", "shadcn/ui",
              "TailwindCSS", "Gemini Explicit Cache", "HNSW Indexes",
            ].map((t) => (
              <span key={t} className="px-3 py-1.5 bg-card border border-card-border rounded-full text-sm text-muted hover:border-accent/40 hover:text-foreground transition-colors">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

function CapabilityCard({
  icon: Icon,
  title,
  badge,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  badge: "DONE" | "PARTIAL" | "PLANNED"
  items: string[]
}) {
  const badgeColor =
    badge === "DONE"
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : badge === "PARTIAL"
      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      : "bg-white/5 text-white/40 border-white/10"

  return (
    <div className="glass-panel hover:border-accent/40 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", badgeColor)}>
          {badge}
        </span>
      </div>
      <h3 className="font-bold text-foreground mb-3">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-muted">
            <ChevronRight className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ToolGroup({
  title,
  icon: Icon,
  tools,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  tools: [string, string][]
}) {
  return (
    <div className="glass-panel hover:border-accent/40 transition-all">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
        <Icon className="w-4 h-4 text-accent" />
        <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <ul className="space-y-3">
        {tools.map(([name, desc]) => (
          <li key={name} className="flex items-start gap-3">
            <code className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5">{name}</code>
            <span className="text-xs text-muted leading-relaxed">{desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
