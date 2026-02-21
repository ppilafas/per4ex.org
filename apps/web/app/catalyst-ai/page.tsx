import Image from "next/image"
import { Cpu, Mic, Shield, Server, Terminal, Layers, Link as LinkIcon, Globe, Database, Zap, Brain, MessageSquare, Clock, ArrowRight, User, Users, ChevronRight } from "lucide-react"
import { TypewriterSubtitle } from "@/components/typewriter"
// import { VoiceWidget } from "@/components/voice-widget"
import { DashboardFeatures } from "@/components/dashboard-features"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function CatalystAI() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-4">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[180px] h-[180px] mb-6 rounded-full overflow-hidden hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
             <Image src="/catalyst3d.png" alt="Catalyst AI" fill className="object-cover p-2" priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Catalyst AI</h1>
          <TypewriterSubtitle 
             text="Production-Ready Multi-Tenant AI Assistant Platform" 
             className="mb-6 text-lg md:text-xl"
             cursorColor="bg-accent"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      {/* Executive Summary */}
      <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden bg-gradient-to-br from-card to-background">
          <div className="relative z-10">
              <div className="text-lg text-muted leading-relaxed space-y-4">
                  <p>
                      Catalyst is a production AI platform for teams that want the power of modern models without the fragility of demo-grade apps. It pairs a modern web experience with a persistent background service to deliver real-time chat and voice, retrieval across your knowledge base, proactive workflows, and deep integrations—while enforcing <strong className="text-foreground">hard multi-tenant isolation</strong> and operational control from day one.
                  </p>
                  <p>
                      Under the hood, Catalyst is built like infrastructure: tenant-scoped data and configuration, model routing across providers, vector-backed RAG, tool orchestration with safety gates, and the observability and governance hooks needed to run AI safely in real environments. The result is AI that doesn't just "answer"—it <strong className="text-foreground">operates</strong>: predictably, securely, and at scale.
                  </p>
                  <p>
                      If you're moving from prototype to production, Catalyst is the foundation that lets you ship fast and stay in control.
                  </p>
              </div>
          </div>
          {/* Decorative watermark */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Brain className="w-64 h-64 text-accent" />
          </div>
      </div>

      {/* Hero Stats / Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel flex flex-col items-center justify-center p-4 text-center group hover:bg-accent/5">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-foreground">Status</div>
          <div className="text-xs text-muted">Production Live</div>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center p-4 text-center group hover:bg-accent/5">
          <Clock className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-bold text-foreground">Latency</div>
          <div className="text-xs text-muted">&lt;300ms (Voice)</div>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center p-4 text-center group hover:bg-accent/5">
          <Database className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-bold text-foreground">Storage</div>
          <div className="text-xs text-muted">pgvector / RLS</div>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center p-4 text-center group hover:bg-accent/5">
          <Shield className="w-6 h-6 text-accent mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-bold text-foreground">Security</div>
          <div className="text-xs text-muted">AES-256-GCM</div>
        </div>
      </div>

      {/* Production Status */}
      <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Globe className="w-32 h-32 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Cpu className="w-6 h-6 text-accent" />
          Production Environment
        </h2>
        <div className="space-y-6 text-muted leading-relaxed relative z-10">
          <p className="text-lg">
            Catalyst is <strong className="text-foreground">fully operational</strong>, deployed on modern cloud infrastructure with enterprise-grade security and scalability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background/50 p-6 rounded-xl border border-card-border hover:border-accent/40 transition-colors">
              <strong className="text-foreground block mb-4 text-lg flex items-center gap-2 border-b border-card-border pb-2">
                <Server className="w-4 h-4 text-accent" /> Backend Service
              </strong>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span><strong>Platform:</strong> Fly.io (Python 3.11+)</span>
                </li>
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span><strong>Database:</strong> Managed PostgreSQL + pgvector</span>
                </li>
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span><strong>API:</strong> REST (WSGI) & WebSocket</span>
                </li>
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span className="text-green-500">Fully Operational</span>
                </li>
              </ul>
            </div>
            <div className="bg-background/50 p-6 rounded-xl border border-card-border hover:border-accent/40 transition-colors">
              <strong className="text-foreground block mb-4 text-lg flex items-center gap-2 border-b border-card-border pb-2">
                <Globe className="w-4 h-4 text-accent" /> Frontend Ecosystem
              </strong>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span><strong>Platform:</strong> Vercel (Next.js 16)</span>
                </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span><strong>Apps:</strong> Chat Interface & Admin Dashboard</span>
                </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   <span><strong>Styling:</strong> Tailwind CSS + Framer Motion</span>
                </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span className="text-green-500">Production Ready</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Trust Section */}
      <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden bg-gradient-to-br from-card to-background">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Shield className="w-64 h-64 text-accent" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent" />
            Security & Trust
          </h2>
          <div className="text-lg text-muted leading-relaxed space-y-4">
            <p>
              Catalyst is built for environments where privacy and governance matter. The platform enforces <strong className="text-foreground">hard tenant isolation</strong> across API access and storage, supports modern authentication (JWT + OAuth), and includes an encrypted file-handling pipeline for sensitive documents.
            </p>
            <p>
              Operationally, it's designed to be <strong className="text-foreground">auditable</strong>—so teams can reason about access, behavior, and system activity with confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-background/50 p-4 rounded-lg border border-card-border text-center hover:border-accent/40 transition-colors">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <strong className="text-foreground block text-sm mb-1">Hard Isolation</strong>
              <p className="text-xs text-muted">Tenant-level data separation</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-card-border text-center hover:border-accent/40 transition-colors">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Terminal className="w-4 h-4 text-accent" />
              </div>
              <strong className="text-foreground block text-sm mb-1">JWT + OAuth</strong>
              <p className="text-xs text-muted">Modern authentication</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-card-border text-center hover:border-accent/40 transition-colors">
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Database className="w-4 h-4 text-accent" />
              </div>
              <strong className="text-foreground block text-sm mb-1">Encrypted Pipeline</strong>
              <p className="text-xs text-muted">Secure file handling</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Features */}
      <DashboardFeatures />

      {/* Philosophy Section */}
      <div className="glass-panel border-l-4 border-l-accent">
         <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Terminal className="w-6 h-6 text-accent" />
            Zero-Dependency Philosophy
         </h2>
         <div className="space-y-4 text-lg text-muted leading-relaxed">
            <p>
               While many modern AI systems rely on heavy abstraction frameworks like LangChain, 
               <strong>Catalyst implements its own lightweight LLM Router and Tool Runtime.</strong>
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
               <li className="bg-background/50 p-5 rounded-lg border border-card-border hover:-translate-y-1 transition-transform duration-300">
                  <strong className="text-foreground block mb-2 text-lg">Deterministic Control</strong>
                  <p className="text-sm">We know exactly what prompt is sent, every time. No hidden prompt injection from library updates.</p>
               </li>
               <li className="bg-background/50 p-5 rounded-lg border border-card-border hover:-translate-y-1 transition-transform duration-300">
                  <strong className="text-foreground block mb-2 text-lg">Hard Multi-Tenancy</strong>
                  <p className="text-sm">Built from day one to isolate data per-tenant via RLS, rather than retrofitting it.</p>
               </li>
               <li className="bg-background/50 p-5 rounded-lg border border-card-border hover:-translate-y-1 transition-transform duration-300">
                  <strong className="text-foreground block mb-2 text-lg">Micro-Latency</strong>
                  <p className="text-sm">Essential for our Realtime Voice mode, where every millisecond of overhead counts.</p>
               </li>
            </ul>
         </div>
      </div>

      {/* Architecture Visual */}
      <div className="py-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">System Architecture</h2>
        
        <div className="relative p-8 bg-card/30 rounded-2xl border border-dashed border-card-border overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/file.svg')] opacity-5" />
            
            <div className="relative z-10 flex flex-col items-center gap-12">
                {/* Top Layer: Clients */}
                <div className="flex flex-wrap justify-center gap-6">
                    <ArchitectureNode icon={User} label="Web Client" sub="Next.js / React" />
                    <ArchitectureNode icon={Mic} label="Native Voice" sub="Swift / Tauri" accent />
                    <ArchitectureNode icon={Terminal} label="API Client" sub="REST / WS" />
                </div>

                {/* Arrows */}
                <div className="flex gap-24 text-muted/50">
                    <ArrowDown />
                    <ArrowDown />
                    <ArrowDown />
                </div>

                {/* Middle Layer: The Core */}
                <div className="w-full max-w-4xl p-6 rounded-xl border-2 border-accent/30 bg-background/80 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                            <Server className="w-5 h-5 text-accent" /> Catalyst Core Service
                        </h3>
                        <p className="text-sm text-muted">Python 3.11 • AsyncIO • FastAPI</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card rounded border border-card-border text-center">
                            <strong className="text-foreground block">LLM Router</strong>
                            <span className="text-xs text-muted">Model Selection</span>
                        </div>
                        <div className="p-4 bg-card rounded border border-card-border text-center">
                            <strong className="text-foreground block">Tool Runtime</strong>
                            <span className="text-xs text-muted">Sandboxed Execution</span>
                        </div>
                        <div className="p-4 bg-card rounded border border-card-border text-center">
                            <strong className="text-foreground block">Session Manager</strong>
                            <span className="text-xs text-muted">State & Context</span>
                        </div>
                    </div>
                </div>

                 {/* Arrows */}
                <div className="flex gap-24 text-muted/50">
                    <ArrowDown />
                </div>

                {/* Bottom Layer: Data & Infrastructure */}
                <div className="flex flex-wrap justify-center gap-6">
                    <ArchitectureNode icon={Database} label="PostgreSQL" sub="pgvector + RLS" />
                    <ArchitectureNode icon={Brain} label="LLM Providers" sub="OpenAI / Anthropic" />
                    <ArchitectureNode icon={Globe} label="Integrations" sub="Google / Search" />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Voice Architecture */}
           <div className="glass-panel hover:border-accent/40 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                 <Mic className="w-5 h-5 text-accent" /> Adaptive Voice Architecture
              </h3>
              <div className="space-y-6">
                 <div className="relative pl-6 border-l-2 border-accent">
                    <strong className="text-accent block mb-1 text-lg">Realtime Mode (Beta)</strong>
                    <p className="text-sm text-muted mb-2">Direct WebSocket connection to GPT Realtime API.</p>
                    <div className="flex gap-2 text-xs font-mono text-foreground/80">
                        <span className="bg-accent/10 px-2 py-1 rounded">Binary PCM16</span>
                        <span className="bg-accent/10 px-2 py-1 rounded">&lt;300ms Latency</span>
                    </div>
                 </div>

                 <div className="relative pl-6 border-l-2 border-card-border">
                    <strong className="text-foreground block mb-1 text-lg">Chained Mode</strong>
                    <p className="text-sm text-muted mb-2">Traditional STT → LLM → TTS pipeline for complex tasks.</p>
                    <div className="flex gap-2 text-xs font-mono text-foreground/80">
                        <span className="bg-card px-2 py-1 rounded">Whisper</span>
                        <span className="bg-card px-2 py-1 rounded">Tool Use</span>
                        <span className="bg-card px-2 py-1 rounded">Cost Efficient</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Intelligence Engine */}
           <div className="glass-panel hover:border-accent/40 transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                 <Brain className="w-5 h-5 text-accent" /> Intelligence Engine
              </h3>
              <div className="space-y-4">
                  <div className="bg-background/40 p-4 rounded-lg border border-card-border">
                      <strong className="text-foreground block mb-1">Advanced Reasoning</strong>
                      <p className="text-sm text-muted">Native support for reasoning extraction from <span className="text-foreground">OpenAI o1/o3</span> and DeepSeek models, enabling complex problem solving before answering.</p>
                  </div>
                  <div className="bg-background/40 p-4 rounded-lg border border-card-border">
                      <strong className="text-foreground block mb-1">Server-Side Routing</strong>
                      <p className="text-sm text-muted">Dynamic model selection per-tenant. Route simple queries to Flash models and complex reasoning to SOTA models automatically.</p>
                  </div>
                  <div className="bg-background/40 p-4 rounded-lg border border-card-border">
                      <strong className="text-foreground block mb-1">Proactive Intelligence</strong>
                      <p className="text-sm text-muted">Background workers monitor data sources (Calendar, Email) to push context-aware suggestions via WebSocket.</p>
                  </div>
              </div>
           </div>
      </div>

      {/* RAG & Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                 <Database className="w-5 h-5 text-accent" /> Enterprise RAG
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"/> PostgreSQL + pgvector</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"/> Hybrid Search (Keyword + Semantic)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"/> Multiple Vector Stores per Tenant</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-muted">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"/> Server-side File Extraction (PDF/DOCX)</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"/> Encrypted Storage at Rest</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent"/> Namespace Scoping</li>
                  </ul>
              </div>
          </div>
          
          <div className="glass-panel">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                 <Zap className="w-5 h-5 text-accent" /> Integrations
              </h3>
              <ul className="space-y-3 text-sm text-muted">
                  <li className="flex items-start gap-2">
                      <Globe className="w-4 h-4 mt-0.5 text-foreground" />
                      <span><strong>Google Workspace:</strong> Gmail, Calendar, Drive (OAuth2)</span>
                  </li>
                  <li className="flex items-start gap-2">
                      <Globe className="w-4 h-4 mt-0.5 text-foreground" />
                      <span><strong>Web Search:</strong> Real-time information retrieval</span>
                  </li>
                  <li className="flex items-start gap-2">
                      <Database className="w-4 h-4 mt-0.5 text-foreground" />
                      <span><strong>SQL Tools:</strong> Safe, read-only database querying</span>
                  </li>
              </ul>
          </div>
      </div>

      {/* Use Cases */}
      <div className="glass-panel">
         <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Platform Use Cases</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                     <User className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-foreground">For Individuals</h3>
                 <p className="text-muted text-sm max-w-sm mx-auto">
                     A personal "Second Brain" that manages your calendar, drafts emails, remembers documents, and is available via voice while driving or walking.
                 </p>
             </div>
             <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                     <Users className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-foreground">For Enterprise</h3>
                 <p className="text-muted text-sm max-w-sm mx-auto">
                     A secure, multi-tenant platform for deploying specialized agents to employees. Isolate data by department (Tenant) and project (Namespace).
                 </p>
             </div>
         </div>
      </div>

      {/* Live Voice Widget Demo */}
      {/* <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5">
           <Mic className="w-64 h-64" />
        </div>
        <div className="relative z-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Mic className="w-6 h-6 text-accent" />
            Live Voice Mode Demo
            </h2>
            <div className="space-y-4 text-muted leading-relaxed max-w-2xl">
            <p>
                Experience Catalyst's real-time voice mode directly in your browser. This widget connects to the Catalyst production WebSocket endpoint and streams PCM16 audio for ultra-low latency conversations.
            </p>
            <div className="bg-background/50 p-4 rounded-lg border border-card-border inline-block">
                <p className="text-sm text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <strong>Production Endpoint:</strong>
                </p>
                <code className="text-xs bg-black/50 px-2 py-1 rounded block">wss://catalyst-service.fly.dev:8765</code>
                <p className="text-xs text-muted mt-2">Click the voice button below to test the connection</p>
            </div>
            </div>
        </div>
      </div> */}

      {/* Voice Widget - Floating */}
      {/* <VoiceWidget /> */}
    </div>
  )
}

function ArchitectureNode({ icon: Icon, label, sub, accent }: { icon: any, label: string, sub: string, accent?: boolean }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-4 rounded-xl border w-36 h-36 transition-all duration-300 bg-background/80 backdrop-blur-sm",
            accent ? "border-accent/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-card-border"
        )}>
            <div className={cn("p-3 rounded-full mb-3", accent ? "bg-accent/20" : "bg-card")}>
                <Icon className={cn("w-6 h-6", accent ? "text-accent" : "text-foreground")} />
            </div>
            <span className="text-sm font-bold text-foreground text-center leading-tight">{label}</span>
            <span className="text-[10px] text-muted text-center mt-1">{sub}</span>
        </div>
    )
}

function ArrowDown() {
    return (
        <div className="flex flex-col items-center h-12">
            <div className="w-0.5 h-full bg-gradient-to-b from-card-border to-accent/50" />
            <div className="w-2 h-2 border-b-2 border-r-2 border-accent/50 rotate-45 -mt-1" />
        </div>
    )
}
