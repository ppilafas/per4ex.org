import Image from "next/image"
import Link from "next/link"
import { TypewriterSubtitle } from "@/components/typewriter"
import { Navbar } from "@/components/navbar"
import { HeroActions } from "@/components/hero-actions"
import { SolutionsGrid } from "@/components/solutions-grid"
import { CTAButton } from "@/components/cta-button"

export default function Home() {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <div className="flex flex-col items-center relative mb-12">
        <div className="absolute inset-0 hero-grid -z-10" />

        <div className="w-full max-w-7xl px-4 z-10 pt-10 md:pt-14 pb-10 md:pb-14">
          <div className="grid grid-cols-1 gap-10 items-center">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-5 md:mb-6 tracking-tight">
                I Build AI That <br />
                <span className="whitespace-nowrap">
                  Actually <span className="text-accent">Ships.</span>
                </span>
              </h1>

              <TypewriterSubtitle
                text="RAG systems, voice agents, self-hosted inference, autonomous workflows — from prototype to production on real infrastructure."
                className="text-xl md:text-2xl text-muted max-w-2xl mb-8 md:mb-10 leading-relaxed font-sans mx-auto"
                cursorColor="bg-accent"
                speed={30}
              />

              <HeroActions />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Solutions Grid */}
      <SolutionsGrid />

      {/* 4. Currently Building */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">Currently Building</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-accent/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
              </div>
              <h3 className="font-bold text-foreground mb-1">Catalyst AI</h3>
              <p className="text-xs text-muted leading-relaxed">Multi-tenant runtime with voice, RAG, and tool orchestration. Powers 4 products.</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">In Development</span>
              </div>
              <h3 className="font-bold text-foreground mb-1">π.Law</h3>
              <p className="text-xs text-muted leading-relaxed">Legal AI CRM with zero-leakage proxy architecture for sensitive case data.</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Side Project</span>
              </div>
              <h3 className="font-bold text-foreground mb-1">GTO Poker Coach</h3>
              <p className="text-xs text-muted leading-relaxed">Function-calling AI with Monte Carlo equity sim (10k samples), SVG poker table, tool-call inspector.</p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">In Development</span>
              </div>
              <h3 className="font-bold text-foreground mb-1">Let There Be RAG</h3>
              <p className="text-xs text-muted leading-relaxed">SaaS: point at a URL, auto-crawl, build RAG, get an embeddable chat widget.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Philosophy / About */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="glass-panel">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-accent rounded-full"/>
              Engineering Philosophy
            </h3>
            <p className="text-lg leading-relaxed text-muted mb-6">
              I build production AI systems — the kind you can trust, operate, and evolve. I ship platforms that combine RAG knowledge bases, agentic workflows, real-time voice, and deep integrations with business data — without sacrificing security boundaries, observability, or performance.
            </p>
            <p className="text-lg leading-relaxed text-muted">
              <strong className="text-foreground">Catalyst</strong> is my flagship platform: a multi-tenant AI runtime with multi-provider routing, persistent memory, and tooling built for real operations. If you need AI that survives the real world—not just a demo—I can help you design it, ship it, and harden it.
            </p>
          </div>

          <div className="glass-panel h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-foreground mb-6 mt-0">Applied Experience</h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Domains I&apos;ve shipped production systems in:
            </p>
            <div className="space-y-3">
              {[
                { domain: "Legal Tech", detail: "AI-powered case management, document analysis" },
                { domain: "Fleet Management", detail: "Real-time vehicle tracking, route optimization" },
                { domain: "Healthcare / Pharma", detail: "Clinical data pipelines, compliance automation" },
                { domain: "Meeting Intelligence", detail: "Real-time transcription, action item extraction" },
                { domain: "Hosting Infrastructure", detail: "Multi-tenant platforms, GPU resource management" },
              ].map((item) => (
                <div key={item.domain} className="group">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.domain}</span>
                      <p className="text-xs text-muted/70">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Catalyst AI (Flagship) */}
      <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/file.svg')] opacity-[0.03]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             {/* Left: Content */}
             <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold tracking-wide border border-accent/20">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   FLAGSHIP PLATFORM
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                   Catalyst AI <br/>
                   <span className="text-muted text-3xl md:text-4xl">Multi-Tenant Runtime.</span>
                </h2>
                
                <p className="text-lg text-muted/80 leading-relaxed max-w-xl">
                   A production-grade AI platform built for operations, not just demos. 
                   Featuring hard tenant isolation, custom LLM routing, and a real-time voice layer 
                   clocking under 300ms latency.
                </p>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
                      <div className="text-2xl font-bold text-white mb-1 font-mono">&lt;300ms</div>
                      <div className="text-xs text-muted uppercase tracking-wider">Voice Latency</div>
                   </div>
                   <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
                      <div className="text-2xl font-bold text-white mb-1">100%</div>
                      <div className="text-xs text-muted uppercase tracking-wider">Data Isolation</div>
                   </div>
                   <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
                      <div className="text-2xl font-bold text-white mb-1 font-mono">RLS</div>
                      <div className="text-xs text-muted uppercase tracking-wider">Row Level Security</div>
                   </div>
                   <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
                      <div className="text-2xl font-bold text-white mb-1 font-mono">OSS</div>
                      <div className="text-xs text-muted uppercase tracking-wider">Zero-Dependency</div>
                   </div>
                </div>
             </div>

             {/* Right: Visual */}
             <div className="relative">
                <div className="relative z-10 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                   <Image 
                      src="/catalyst3d.png" 
                      alt="Catalyst Interface" 
                      width={800} 
                      height={600} 
                      className="w-full h-auto object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 8. Featured Work */}
      <div className="py-20 px-6 bg-[#0c0c0c] border-t border-white/5">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Featured Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          
          {/* π.Law Card */}
          <Link href="/pilaw" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-[#0a0a0a]">
            <div className="h-56 relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
               <div className="relative w-44 h-44">
                 <Image 
                   src="/pilaw3d.png" 
                   alt="π.Law" 
                   fill 
                   className="object-contain transition-transform duration-500 group-hover:scale-110" 
                 />
               </div>
            </div>
            <div className="p-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">π.Law</h3>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Legal AI</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">Legal case management with automated document analysis and vector retrieval.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">RAG</span>
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">PostgreSQL</span>
              </div>
            </div>
          </Link>

          {/* Silicon Smackdown Card */}
          <Link href="/silicon-smackdown" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-[#0a0a0a]">
            <div className="h-56 relative bg-gradient-to-br from-purple-900/20 to-[#0a0a0a] flex items-center justify-center">
               <div className="relative w-44 h-44">
                 <Image 
                   src="/silicon_smacdown/big_hero_logo.png" 
                   alt="Silicon Smackdown" 
                   fill 
                   className="object-contain transition-transform duration-500 group-hover:scale-110" 
                 />
               </div>
            </div>
            <div className="p-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Silicon Smackdown</h3>
                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Voice AI</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">Real-time AI talk show with full-duplex voice debates. 20+ personalities powered by Gemini Live API.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">Gemini Live</span>
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">&lt;100ms</span>
              </div>
            </div>
          </Link>

          {/* Forensic AI Studio Card */}
          <Link href="/forensics" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-[#0a0a0a]">
            <div className="h-56 relative bg-gradient-to-br from-emerald-950/40 to-[#0a0a0a] flex items-center justify-center">
               <div className="relative w-44 h-44 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:drop-shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-500">
                 <Image 
                   src="/detective.png" 
                   alt="Forensic AI Studio" 
                   fill 
                   className="object-contain transition-transform duration-500 group-hover:scale-110" 
                 />
               </div>
            </div>
            <div className="p-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Forensic AI Studio</h3>
                <span className="bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Personal</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">Private AI investigator built for a real legal case. Ingests evidence, maps entities, analyzes audio, reasons across 100K+ documents.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">28+ Agent Tools</span>
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">pgvector</span>
              </div>
            </div>
          </Link>

          {/* GTO Poker Coach Card */}
          <div className="group block rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-all bg-[#0a0a0a]">
            <div className="h-56 relative bg-gradient-to-br from-amber-950/30 to-[#0a0a0a] flex items-center justify-center">
               <div className="text-6xl">♠️</div>
            </div>
            <div className="p-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">GTO Poker Coach</h3>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Side Project</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">Function-calling AI coach with Monte Carlo equity simulation (10k samples), interactive SVG poker table, and tool-call inspector UI.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">Tool Calling</span>
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">Monte Carlo</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 9. Beyond Code */}
      <div className="py-20 px-6 bg-[#080808] border-t border-white/5">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Beyond Code</h2>
        <div className="max-w-md mx-auto">
          <Link href="/authored-works" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-[#0a0a0a]">
            <div className="h-56 relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center overflow-hidden">
               <div className="relative w-44 h-44">
                 <Image 
                   src="/parisian_author.png" 
                   alt="Cosmic Dice" 
                   fill 
                   className="object-contain transition-transform duration-500 group-hover:scale-110" 
                 />
               </div>
            </div>
            <div className="p-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Cosmic Dice</h3>
                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Book</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">If everything is predetermined, what meaning does responsibility have? If everything is random, what meaning does love have? A philosophical exploration of consciousness, agency, and synthetic minds.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 10. Social Proof + Call to Action */}
      <div className="py-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-sm text-muted">
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">10+</span>
            <span>Production Systems</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">Self-Hosted</span>
            <span>&</span>
            <span className="text-accent font-bold">Cloud</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold">5+</span>
            <span>Years AI/ML</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Ship?</h2>
          <p className="text-muted mb-8">
            Tell me about your project and let's figure out the best path forward.
          </p>
          
          <CTAButton />
          
          <p className="text-muted/60 text-sm mb-8">Typically respond within 24 hours</p>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link href="/technical-expertise" className="text-muted hover:text-accent transition-colors">
              View Full Portfolio
            </Link>
            <span className="text-white/10">•</span>
            <Link href="/privacy" className="text-muted/60 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
