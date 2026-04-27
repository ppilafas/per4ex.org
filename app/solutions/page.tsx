"use client"

import { 
  MessageSquare, 
  Database, 
  Mic, 
  FileText, 
  Bot, 
  Server,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const SOLUTIONS = [
  {
    id: "rag",
    icon: Database,
    title: "RAG & Knowledge Systems",
    what: "Semantic search over your own data with citation grounding. Hybrid retrieval (keyword + vector), namespace scoping, multi-tenant isolation.",
    proof: "Built into Catalyst (powers 4 products), π.Law (legal case data), Forensic AI Studio (100K+ documents), and Let There Be RAG (SaaS).",
    stack: ["PostgreSQL + pgvector", "Hybrid Search", "Firecrawl", "Retrieve-then-Rerank"],
    proofLink: "/catalyst-ai",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice AI & Real-Time Audio",
    what: "Full-duplex voice agents with sub-300ms latency, turn-taking, and interruption handling. Self-hosted STT/TTS or cloud APIs.",
    proof: "Silicon Smackdown runs live multi-personality voice debates. Catalyst's voice layer handles real-time conversations with tool calling.",
    stack: ["Gemini Live API", "Whisper STT", "Kokoro TTS", "WebSocket Streaming"],
    proofLink: "/silicon-smackdown",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  {
    id: "agents",
    icon: Bot,
    title: "AI Agent Systems",
    what: "Function-calling agents with tool orchestration, multi-step planning, and human-in-the-loop gates. MCP protocol for IDE-native agent tooling.",
    proof: "Forensic AI Studio exposes 39 MCP tools to Copilot. GTO Poker Coach uses function-calling with Monte Carlo simulation. Catalyst orchestrates tools across tenants.",
    stack: ["Function Calling", "MCP SDK", "Tool Orchestration", "Multi-Agent Delegation"],
    proofLink: "/forensics",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  {
    id: "documents",
    icon: FileText,
    title: "Document Intelligence",
    what: "Automated parsing, semantic chunking, and structured extraction from PDFs, DOCX, and web content. Entity mapping across large document sets.",
    proof: "Forensic AI Studio processes legal evidence at scale. π.Law handles case documents with zero-leakage proxy architecture.",
    stack: ["PDF/DOCX Extraction", "Entity Graphs", "Vector Embeddings", "Structured Output"],
    proofLink: "/pilaw",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  },
  {
    id: "infra",
    icon: Server,
    title: "Self-Hosted AI Infrastructure",
    what: "Deploy LLM inference, STT, and TTS on your own hardware. No cloud vendor lock-in. VRAM optimization, quantization, multi-service orchestration.",
    proof: "Running vLLM, llama.cpp, Whisper, and Kokoro on bare-metal RTX GPUs with Supervisor and Nginx orchestration.",
    stack: ["vLLM", "llama.cpp", "GPTQ/AWQ", "Supervisor + systemd"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  }
]

function SolutionCard({ solution }: { solution: typeof SOLUTIONS[0] }) {
  const Icon = solution.icon
  
  return (
    <div className={`p-6 rounded-xl border ${solution.borderColor} bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col h-full`}>
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl ${solution.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${solution.color}`} />
        </div>
        <h3 className="text-xl font-bold text-foreground pt-2">{solution.title}</h3>
      </div>
      
      <div className="space-y-4 mb-6 flex-1">
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">What I Build</div>
          <p className="text-sm text-foreground/80 leading-relaxed">{solution.what}</p>
        </div>
        
        <div>
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Where It Runs</div>
          <p className="text-sm text-muted/80 leading-relaxed">{solution.proof}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Stack</div>
        <div className="flex flex-wrap gap-2">
          {solution.stack.map((tech) => (
            <span 
              key={tech} 
              className="px-2 py-1 text-xs rounded bg-white/5 text-muted border border-white/10"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {solution.proofLink && (
        <Link
          href={solution.proofLink}
          className={`w-full py-3 rounded-lg font-bold text-sm ${solution.bgColor} ${solution.color} border ${solution.borderColor} hover:bg-opacity-20 transition-colors flex items-center justify-center gap-2 mt-auto`}
        >
          See It In Action
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

export default function SolutionsPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <div className="text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          What I <span className="text-accent">Build</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Every solution below runs in production, backed by a real project you can explore on this site.
        </p>
      </div>
      
      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SOLUTIONS.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </div>
      
      {/* Bottom CTA */}
      <div className="text-center py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold text-foreground mb-4">Have a different problem?</h2>
        <p className="text-muted mb-6 max-w-lg mx-auto">
          If it involves LLMs, real-time data, or production infrastructure, I can probably help.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
          className="px-8 py-4 bg-accent text-black rounded-full font-bold text-lg hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Let&apos;s Talk
        </button>
      </div>
    </div>
  )
}
