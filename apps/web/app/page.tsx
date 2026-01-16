import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { TypewriterSubtitle } from "@/components/typewriter"
import { Navbar } from "@/components/navbar"
import { HeroActions } from "@/components/hero-actions"
import { SolutionsGrid } from "@/components/solutions-grid"
import { Search } from "lucide-react"
import { CTAButton } from "@/components/cta-button"

export default function Home() {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <div className="flex flex-col items-center relative mb-12">
        <div className="absolute inset-0 hero-grid -z-10" />
        
        <div className="flex flex-col items-center z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-center text-foreground mb-6 tracking-tight">
            Ship Production AI <br/>
            <span className="text-accent">Faster.</span>
          </h1>
          
          <TypewriterSubtitle 
             text="I help teams escape demo hell. RAG systems, voice agents, autonomous workflows — built to actually ship."
             className="text-xl md:text-2xl text-muted max-w-2xl mb-10 leading-relaxed font-sans"
             cursorColor="bg-accent"
             speed={30}
          />

          <HeroActions />
        </div>
      </div>

      {/* 2. Solutions Grid */}
      <SolutionsGrid />

      {/* 4. How I Work */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">How I Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-accent font-bold font-mono text-sm">01</span>
              </div>
              <h3 className="font-bold text-foreground mb-2">Discovery</h3>
              <p className="text-sm text-muted leading-relaxed">We define scope, constraints, and success metrics together.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-accent font-bold font-mono text-sm">02</span>
              </div>
              <h3 className="font-bold text-foreground mb-2">Build</h3>
              <p className="text-sm text-muted leading-relaxed">Iterative development with weekly demos and feedback loops.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-accent font-bold font-mono text-sm">03</span>
              </div>
              <h3 className="font-bold text-foreground mb-2">Ship</h3>
              <p className="text-sm text-muted leading-relaxed">Production deployment with documentation and support handoff.</p>
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
              I build production AI systems—the kind enterprises can trust, operate, and evolve. I help teams move from AI excitement to AI reliability: shipping platforms that combine RAG knowledge bases, agentic workflows, real-time voice, and deep integrations with Google Workspace and enterprise data—without sacrificing security boundaries, observability, or performance.
            </p>
            <p className="text-lg leading-relaxed text-muted">
              <strong className="text-foreground">Catalyst</strong> is my flagship platform: a multi-tenant AI runtime with multi-provider routing, persistent memory, and tooling built for real operations. If you need AI that survives the real world—not just a demo—I can help you design it, ship it, and harden it.
            </p>
          </div>

          <div className="glass-panel h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-foreground mb-6 mt-0">Technical Expertise</h3>
            <div className="space-y-5">
              {[
                { label: "AI/ML Infrastructure", level: 5, status: "Expert" },
                { label: "Distributed Systems", level: 4, status: "Advanced" },
                { label: "RAG & Knowledge Systems", level: 5, status: "Expert" },
                { label: "MLOps & Cloud", level: 4, status: "Advanced" },
                { label: "Data Engineering", level: 4, status: "Advanced" },
                { label: "Systems Architecture", level: 5, status: "Expert" },
              ].map((skill) => (
                <div key={skill.label} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">{skill.label}</span>
                    <span className="text-xs text-accent/80 font-mono tracking-wider uppercase">{skill.status}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((block) => (
                      <div 
                        key={block}
                        className={cn(
                          "h-1 flex-1 rounded-sm transition-all duration-500",
                          block <= skill.level 
                            ? "bg-accent" 
                            : "bg-white/5"
                        )}
                      />
                    ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
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
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Enterprise</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">Legal case management with automated document analysis and vector retrieval.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">RAG</span>
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">PostgreSQL</span>
              </div>
            </div>
          </Link>

          {/* The Per4ex.org Show Card */}
          <Link href="/show" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-black">
            <div className="h-56 relative flex items-center justify-center">
               <div className="relative w-52 h-52">
                 <Image 
                   src="/per4ex_new.png" 
                   alt="The Per4ex.org Show" 
                   fill 
                   className="object-contain transition-transform duration-500 group-hover:scale-110" 
                 />
               </div>
            </div>
            <div className="p-5 border-t border-white/5 bg-[#0a0a0a]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">The Per4ex.org Show</h3>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Live</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 leading-relaxed">A live talk show where I moderate conversations between AI guests. Real-time via Ably.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">Multi-Agent</span>
                <span className="bg-white/5 text-white/60 px-2 py-0.5 rounded text-xs">WebSockets</span>
              </div>
            </div>
          </Link>
          
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
            <span className="text-accent font-bold">Enterprise</span>
            <span>&</span>
            <span className="text-accent font-bold">Startup</span>
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
