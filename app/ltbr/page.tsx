import { TypewriterSubtitle } from "@/components/typewriter"
import { Globe, Database, ChatCircle as MessageSquare, CreditCard, Code, StackSimple as Layers } from "@phosphor-icons/react/ssr"
export default function LTBR() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 flex items-center justify-center">
            <span className="text-6xl">📡</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Let There Be RAG</h1>
          <TypewriterSubtitle 
             text="Point at a URL. Get a knowledge base. Embed a chat widget." 
             className="mb-6 text-lg md:text-xl"
             cursorColor="bg-amber-500"
          />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">In Development</span>
          </div>
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      {/* What It Does */}
      <div className="glass-panel border-l-4 border-l-amber-500">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Globe className="w-6 h-6 text-amber-500" />
          The Idea
        </h2>
        <p className="text-lg text-muted leading-relaxed">
          Give it a URL. It crawls the site, chunks the content, builds vector embeddings, and gives you
          a ready-to-embed chat widget that answers questions about that content. 
          No infrastructure to manage. No prompts to write. Just paste a script tag.
        </p>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-sidebar-border pb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-foreground mb-2">1. Crawl</h3>
            <p className="text-sm text-muted leading-relaxed">
              Firecrawl-powered web crawling. Point at a domain, it discovers and extracts all pages automatically.
            </p>
          </div>
          <div className="glass-panel text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-foreground mb-2">2. Index</h3>
            <p className="text-sm text-muted leading-relaxed">
              Content is chunked, embedded, and stored in a per-tenant vector store. Retrieve-then-rerank pipeline for accuracy.
            </p>
          </div>
          <div className="glass-panel text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-foreground mb-2">3. Chat</h3>
            <p className="text-sm text-muted leading-relaxed">
              Embeddable widget answers visitor questions grounded in the crawled content. Copy a script tag. Done.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-sidebar-border pb-3">Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> Multi-Tenant
            </h3>
            <ul className="space-y-3 text-muted">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /><span>Isolated vector stores per customer</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /><span>Credit-based usage billing</span></li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" /><span>Dashboard for crawl management and analytics</span></li>
            </ul>
          </div>
          <div className="glass-panel">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-amber-400" /> Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js", "PostgreSQL", "pgvector", "Firecrawl",
                "OpenAI Embeddings", "Retrieve-then-Rerank", "Stripe", "Embeddable Widget"
              ].map(tech => (
                <span key={tech} className="bg-card text-foreground px-3 py-1.5 rounded border border-card-border text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Model */}
      <div className="glass-panel border-l-4 border-l-amber-500">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" /> Business Model
        </h3>
        <p className="text-muted leading-relaxed">
          Credit-based SaaS. Users buy crawl credits and query credits. 
          No monthly minimum — pay for what you use. Free tier for small sites.
        </p>
      </div>
    </div>
  )
}
