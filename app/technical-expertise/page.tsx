import Image from "next/image"
import { TypewriterSubtitle } from "@/components/typewriter"
import Link from "next/link"

export default function TechnicalExpertise() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden">
             <Image src="/current_focus.png" alt="Technical Expertise" fill className="object-cover p-2" priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Technical Expertise</h1>
          <TypewriterSubtitle 
             text="What I actually build with — mapped to real projects" 
             className="mb-6 text-lg md:text-xl"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      {/* Project-Mapped Skills */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">RAG & Knowledge Systems</h3>
             <ul className="space-y-3 text-muted leading-relaxed">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>PostgreSQL + pgvector hybrid search (keyword + semantic)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Retrieve-then-rerank pipelines with citation grounding</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Multi-tenant vector stores with namespace scoping</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Firecrawl web crawling + auto-chunking</span></li>
             </ul>
             <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/catalyst-ai" className="text-xs text-accent/70 hover:text-accent transition-colors">Catalyst</Link>
                <span className="text-white/20">·</span>
                <Link href="/pilaw" className="text-xs text-accent/70 hover:text-accent transition-colors">π.Law</Link>
                <span className="text-white/20">·</span>
                <Link href="/forensics" className="text-xs text-accent/70 hover:text-accent transition-colors">Forensic AI Studio</Link>
             </div>
           </div>

           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">Voice & Real-Time AI</h3>
             <ul className="space-y-3 text-muted leading-relaxed">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Gemini Live API — full-duplex voice (&lt;100ms latency)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Whisper STT on local GPU (real-time transcription)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Kokoro / edge-tts on-premises TTS</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>WebSocket streaming with turn-taking & interruption handling</span></li>
             </ul>
             <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/silicon-smackdown" className="text-xs text-accent/70 hover:text-accent transition-colors">Silicon Smackdown</Link>
                <span className="text-white/20">·</span>
                <Link href="/catalyst-ai" className="text-xs text-accent/70 hover:text-accent transition-colors">Catalyst Voice Layer</Link>
             </div>
           </div>

           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">AI Agent Architecture</h3>
             <ul className="space-y-3 text-muted leading-relaxed">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Function-calling with tool orchestration (OpenAI, Gemini, HF)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>MCP (Model Context Protocol) — 39 tools exposed to IDE agents</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Multi-agent delegation and persistent chat memory</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Monte Carlo simulation tools (eval7, equity calculation)</span></li>
             </ul>
             <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/forensics" className="text-xs text-accent/70 hover:text-accent transition-colors">Forensic AI Studio</Link>
                <span className="text-white/20">·</span>
                <span className="text-xs text-muted/60">GTO Poker Coach</span>
             </div>
           </div>

           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">Platform Engineering</h3>
             <ul className="space-y-3 text-muted leading-relaxed">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Multi-tenant isolation (RLS, namespace scoping)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Multi-provider LLM routing (Gemini, OpenAI, HuggingFace, local)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Google Workspace integration (Gmail, Calendar, Drive via OAuth2)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" /><span>Real-time WebSocket APIs, SSE streaming</span></li>
             </ul>
             <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/catalyst-ai" className="text-xs text-accent/70 hover:text-accent transition-colors">Catalyst</Link>
                <span className="text-white/20">·</span>
                <Link href="/pilaw" className="text-xs text-accent/70 hover:text-accent transition-colors">π.Law</Link>
             </div>
           </div>
        </div>
      </div>

      {/* Self-Hosted AI Infrastructure */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mt-12 mb-6 border-b-2 border-sidebar-border pb-3">Self-Hosted AI Infrastructure</h2>
        <div className="glass-panel border-l-4 border-l-accent">
          <p className="text-lg text-muted leading-relaxed mb-6">
            I deploy and operate LLM inference stacks on bare metal — no cloud vendor lock-in. 
            This includes model serving, speech-to-text, text-to-speech, and multi-service orchestration on RTX-class GPUs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Model Serving</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>vLLM (continuous batching, tool calling)</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>llama.cpp / llama-server</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>GPTQ / AWQ quantization</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>VRAM optimization & GPU resource mgmt</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Speech Pipeline</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>Whisper STT on local GPU</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>Kokoro TTS engine</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>Real-time audio streaming</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Orchestration</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>Supervisor / systemd service management</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>Nginx reverse proxy + SSL</span></li>
                <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" /><span>Multi-service coordination on bare metal</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Core Stack */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mt-4 mb-6 border-b-2 border-sidebar-border pb-3">Core Stack</h2>
        <div className="glass-panel">
             <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "Python", "TypeScript", "FastAPI", "Next.js", "React",
                  "PostgreSQL", "pgvector", "Redis", "Docker",
                  "vLLM", "llama.cpp", "Whisper", "Kokoro",
                  "OpenAI SDK", "Gemini API", "HuggingFace",
                  "MCP SDK", "Playwright", "Firecrawl",
                  "CCXT", "eval7", "Fly.io", "Supervisor", "Nginx", "Git"
                ].map(tech => (
                  <span key={tech} className="bg-card text-foreground px-4 py-2 rounded border border-card-border text-sm">
                    {tech}
                  </span>
                ))}
             </div>
        </div>
      </div>
    </div>
  )
}
