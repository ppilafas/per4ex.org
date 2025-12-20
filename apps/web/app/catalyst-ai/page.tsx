import Image from "next/image"
import { Cpu, Mic, Shield, Server, Terminal, Layers } from "lucide-react"

export default function CatalystAI() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
             <Image src="/catalyst.png" alt="Catalyst AI" fill className="object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Catalyst AI</h1>
          <p className="text-xl md:text-2xl text-center text-muted">A local-first, always-on personal AI operating system</p>
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      {/* Philosophy Section - The "Flex" */}
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
            <p>
               This architecture decision was made to ensure:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
               <li className="bg-background/50 p-4 rounded-lg border border-card-border">
                  <strong className="text-foreground block mb-2">Deterministic Control</strong>
                  We know exactly what prompt is sent, every time. No hidden prompt injection from library updates.
               </li>
               <li className="bg-background/50 p-4 rounded-lg border border-card-border">
                  <strong className="text-foreground block mb-2">Hard Multi-Tenancy</strong>
                  Built from day one to isolate data per-tenant via RLS, rather than retrofitting it onto a single-user framework.
               </li>
               <li className="bg-background/50 p-4 rounded-lg border border-card-border">
                  <strong className="text-foreground block mb-2">Micro-Latency</strong>
                  Essential for our Realtime Voice mode, where every millisecond of framework overhead counts.
               </li>
            </ul>
         </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-sidebar-border pb-3">System Architecture</h2>
        
        <div className="glass-panel space-y-12">
           
           {/* Architecture Visual Placeholder (we can replace with SVG later) */}
           <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-6 bg-background/30 rounded-xl border border-dashed border-card-border">
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto border border-card-border"><Mic className="w-8 h-8 text-accent"/></div>
                 <div className="text-sm font-bold">Native Voice</div>
              </div>
              <div className="h-0.5 w-12 bg-card-border md:block hidden"></div>
              <div className="text-center p-6 bg-card rounded-xl border-2 border-accent/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                 <div className="text-xl font-bold text-foreground mb-2">Catalyst Core</div>
                 <div className="text-sm text-muted">Daemon • Router • State</div>
              </div>
              <div className="h-0.5 w-12 bg-card-border md:block hidden"></div>
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto border border-card-border"><Layers className="w-8 h-8 text-accent"/></div>
                 <div className="text-sm font-bold">π.Law / Apps</div>
              </div>
           </div>

           <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                 <Server className="w-5 h-5" /> Persistent Service Core
              </h3>
              <p className="text-muted leading-relaxed mb-4">
                 At the heart of Catalyst is a long-running backend service that runs as a 
                 <span className="bg-card-border px-2 py-0.5 rounded text-foreground text-sm mx-1">launchd</span> daemon on macOS.
                 Unlike stateless scripts, it maintains conversation continuity, manages background jobs, and keeps a persistent WebSocket open for proactive intelligence.
              </p>
           </div>

           <hr className="border-card-border" />

           <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                 <Mic className="w-5 h-5" /> Adaptive Voice & Cost Optimization
              </h3>
              <p className="text-muted leading-relaxed mb-6">
                 Catalyst supports a <strong>Multi-Model Voice Architecture</strong> designed to balance latency against inference costs.
                 The system intelligently routes conversational turns based on complexity.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-background/40 p-5 rounded-lg border border-card-border">
                    <strong className="text-accent block mb-2 text-lg">Realtime Mode (Beta)</strong>
                    <ul className="text-muted text-sm space-y-2 list-disc pl-4">
                       <li><strong>Tech:</strong> GPT Realtime API via WebSocket</li>
                       <li><strong>Latency:</strong> Ultra-low (&lt;300ms)</li>
                       <li><strong>Data:</strong> Binary PCM16 Audio Streams</li>
                       <li><strong>Use Case:</strong> Fluid, interruption-heavy conversation where speed is paramount.</li>
                    </ul>
                 </div>

                 <div className="bg-background/40 p-5 rounded-lg border border-card-border">
                    <strong className="text-accent block mb-2 text-lg">Chained Mode (Cost-Efficient)</strong>
                    <ul className="text-muted text-sm space-y-2 list-disc pl-4">
                       <li><strong>Tech:</strong> Whisper (STT) → Local/Flash LLM → TTS</li>
                       <li><strong>Control:</strong> Maximum tool reliability</li>
                       <li><strong>Cost:</strong> ~60% cheaper operational cost</li>
                       <li><strong>Use Case:</strong> Structured commands, RAG queries, and long-running tasks.</li>
                    </ul>
                 </div>
              </div>
           </div>
           
           <hr className="border-card-border" />
           
           <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                 <Shield className="w-5 h-5" /> Security & Native Clients
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                      <strong className="text-foreground block mb-2">Tenant Isolation</strong>
                      <p className="text-muted text-sm leading-relaxed mb-4">
                          Catalyst isn't just a prototype; it's a platform. It enforces hard multi-tenancy at the database layer using Postgres RLS (Row Level Security) and strictly binds API keys to tenants.
                      </p>
                  </div>
                  <div>
                      <strong className="text-foreground block mb-2">Native SwiftUI Client</strong>
                      <p className="text-muted text-sm leading-relaxed">
                          We built a fully native macOS client to handle raw PCM audio buffers with zero-latency overhead—something impossible in a standard browser environment. This allows for "human-level" interruptibility.
                      </p>
                  </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
