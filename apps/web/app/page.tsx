import Image from "next/image"
import { TypewriterSubtitle } from "@/components/typewriter"
import { Bot, RefreshCw, Brain, BarChart, Search, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
             <Image src="/avatar.png" alt="Avatar" fill className="object-cover" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-center text-foreground mb-2">Per4ex.org</h1>
          <TypewriterSubtitle text="Specialized in AI-Related Ecosystems" />
        </div>
        <div />
      </div>

      <div className="text-lg md:text-xl leading-relaxed text-muted text-center max-w-3xl mx-auto">
        <p>
          Welcome to Per4ex.org, a systems-focused portfolio for AI-related ecosystems.
        </p>
      </div>

      {/* About Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mt-12 mb-6 border-b-2 border-sidebar-border pb-3">About</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="glass-panel">
            <p className="text-lg leading-relaxed text-muted mb-6">
              I design, build, and optimize complex systems at the intersection of artificial intelligence, 
              infrastructure, and human-computer interaction. My expertise spans the full stack of AI ecosystems—from 
              distributed computing architectures and <span className="bg-card-border px-2 py-0.5 rounded text-foreground text-base">MLOps</span> pipelines to intelligent agent systems and knowledge 
              management platforms.
            </p>
            <p className="text-lg leading-relaxed text-muted mb-6">
              I focus on creating robust, scalable systems that enable AI capabilities while maintaining 
              reliability, observability, and ethical considerations. Whether it's building <span className="bg-card-border px-2 py-0.5 rounded text-foreground text-base">RAG</span> systems, 
              orchestrating multi-agent workflows, or architecting data pipelines for machine learning, 
              I bring a systems thinking approach to every challenge.
            </p>
            <p className="text-lg leading-relaxed text-muted">
              The Catalyst backend service is a persistent macOS <span className="bg-card-border px-2 py-0.5 rounded text-foreground text-base">launchd</span> daemon that provides long-running state management, 
              proactive message generation, background data fetching, and WebSocket communication for the Catalyst AI assistant platform.
            </p>
          </div>

          <div className="glass-panel h-full flex flex-col justify-center">
            <h3 className="text-xl font-bold text-foreground mb-6 mt-0">Core Focus Areas</h3>
            <ul className="space-y-4 text-muted">
               <li className="flex items-center gap-3">
                 <Bot className="w-5 h-5 text-foreground" /> 
                 <strong className="text-foreground">AI/ML Infrastructure</strong>
               </li>
               <li className="flex items-center gap-3">
                 <RefreshCw className="w-5 h-5 text-foreground" />
                 <strong className="text-foreground">Distributed Systems</strong>
               </li>
               <li className="flex items-center gap-3">
                 <Brain className="w-5 h-5 text-foreground" />
                 <strong className="text-foreground">Intelligent Agents</strong>
               </li>
               <li className="flex items-center gap-3">
                 <BarChart className="w-5 h-5 text-foreground" />
                 <strong className="text-foreground">Data Engineering</strong>
               </li>
               <li className="flex items-center gap-3">
                 <Search className="w-5 h-5 text-foreground" />
                 <strong className="text-foreground">RAG & Knowledge Systems</strong>
               </li>
               <li className="flex items-center gap-3">
                 <Settings className="w-5 h-5 text-foreground" />
                 <strong className="text-foreground">MLOps & Observability</strong>
               </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
