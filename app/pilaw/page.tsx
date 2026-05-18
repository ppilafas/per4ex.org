import Image from "next/image"
import { Database, Lock, HardDrives as Server, ArrowRight } from "@phosphor-icons/react/ssr"
import { TypewriterSubtitle } from "@/components/typewriter"

export default function PiLaw() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[180px] h-[180px] mb-6 rounded-full overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-card-border/60 hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
             <Image src="/pilaw3d.png" alt="π.Law" fill className="object-contain p-2 scale-[1.12]" sizes="180px" priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">π.Law</h1>
          <TypewriterSubtitle 
             text="Legal AI CRM with zero-leakage proxy architecture" 
             className="mb-6 text-lg md:text-xl"
             cursorColor="bg-blue-500"
          />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">In Development</span>
          </div>
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      {/* The Hook: Architecture Case Study */}
      <div className="glass-panel border-l-4 border-l-blue-500">
         <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-500" />
            Engineering Case Study
         </h2>
         <p className="text-lg text-muted leading-relaxed">
            π.Law is a production-ready legal AI system.
            It solves the challenge of <strong>"Safe AI over sensitive data"</strong> by decoupling the legal data layer from the AI reasoning layer using a zero-leakage proxy architecture.
         </p>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-sidebar-border pb-3">System Design</h2>
        
        <div className="glass-panel space-y-12">
           
           {/* Flow Diagram Representation */}
           <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-6 bg-background/30 rounded-xl border border-dashed border-card-border text-sm">
              <div className="bg-card p-4 rounded-lg border border-card-border text-center w-full md:w-auto">
                 <strong className="block text-blue-400 mb-1">Next.js Client</strong>
                 <div className="text-xs text-muted">User Interface</div>
              </div>
              <ArrowRight className="text-muted hidden md:block" />
              <div className="bg-card p-4 rounded-lg border-2 border-blue-500/30 text-center w-full md:w-auto relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider">Security Boundary</div>
                 <strong className="block text-foreground mb-1">FastAPI Proxy</strong>
                 <div className="text-xs text-muted">Auth & Sanitization</div>
              </div>
              <ArrowRight className="text-muted hidden md:block" />
              <div className="bg-card p-4 rounded-lg border border-card-border text-center w-full md:w-auto">
                 <strong className="block text-accent mb-1">Catalyst Core</strong>
                 <div className="text-xs text-muted">RAG & Routing</div>
              </div>
              <ArrowRight className="text-muted hidden md:block" />
              <div className="bg-card p-4 rounded-lg border border-card-border text-center w-full md:w-auto opacity-70">
                 <strong className="block text-foreground mb-1">LLM Provider</strong>
                 <div className="text-xs text-muted">Inference Only</div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" /> Hybrid Search Strategy
                 </h3>
                 <p className="text-muted leading-relaxed mb-4">
                    Legal discovery requires high precision. We implemented a hybrid retrieval strategy directly in Postgres:
                 </p>
                 <ul className="space-y-2 text-sm text-muted list-disc pl-4">
                    <li><strong>Semantic Search:</strong> Uses <code className="bg-background/50 px-1 py-0.5 rounded">pgvector</code> for conceptual matching (cosine similarity).</li>
                    <li><strong>Keyword Fallback:</strong> Traditional SQL text search for exact case citations.</li>
                    <li><strong>Infrastructure:</strong> No separate vector DB (Pinecone/Weaviate) required—reducing operational complexity.</li>
                 </ul>
              </div>

              <div>
                 <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-400" /> Zero-Leakage Architecture
                 </h3>
                 <p className="text-muted leading-relaxed mb-4">
                    The frontend never touches the Catalyst API directly. A dedicated backend proxy injects the <code className="bg-background/50 px-1 py-0.5 rounded text-sm">X-Tenant-Id</code> and strips sensitive metadata.
                 </p>
                 <ul className="space-y-2 text-sm text-muted list-disc pl-4">
                    <li><strong>Hard Isolation:</strong> API keys are strictly scoped to tenants.</li>
                    <li><strong>Redaction:</strong> PII is detected and redacted before hitting the LLM logs.</li>
                    <li><strong>Observability:</strong> Every request carries a distributed trace ID for cross-service debugging.</li>
                 </ul>
              </div>
           </div>

           <hr className="border-card-border" />

           <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                  {["Next.js 16 (App Router)", "FastAPI", "Postgres + pgvector", "Docker Compose", "Tailwind + shadcn/ui", "React Query", "Alembic"].map(tech => (
                     <span key={tech} className="bg-card px-3 py-1 rounded-full text-sm border border-card-border text-muted">
                        {tech}
                     </span>
                  ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}

