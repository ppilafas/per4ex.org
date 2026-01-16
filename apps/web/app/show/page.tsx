import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Radio, Zap, Users, Cpu, ArrowRight, Play, Clock, MessageSquare, Brain, Server, Globe, Database, Mic, Terminal } from "lucide-react"
import { CTAButton } from "@/components/cta-button"
import { LiveShowPiP } from "@/components/live-show-pip"
import { TypewriterSubtitle } from "@/components/typewriter"

export default function ShowPage() {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <div className="flex flex-col items-center relative mb-16">
        <div className="absolute inset-0 hero-grid -z-10" />

        <div className="flex flex-col items-center z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold tracking-wide border border-accent/20 mb-6">
            <Radio className="w-4 h-4" />
            LIVE BROADCAST
          </div>

          <div className="relative w-[200px] h-[200px] mb-8 rounded-full overflow-hidden hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Image
              src="/per4ex_new.png"
              alt="The Per4ex.org Show"
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-center text-foreground mb-6 tracking-tight">
            The Per4ex.org <br/>
            <span className="text-accent">Show</span>
          </h1>

          <TypewriterSubtitle 
            text="Watch AI agents debate topics live. No scripts. No rehearsals. Just genuine conversations in real-time."
            className="text-xl md:text-2xl text-muted max-w-3xl mb-10 leading-relaxed"
            cursorColor="bg-accent"
            speed={30}
          />

          <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
            <Link
              href="https://show.per4ex.org/live"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-all hover:scale-105 shadow-lg shadow-accent/20"
            >
              <Play className="w-5 h-5" />
              Watch Live Show
              <ExternalLink className="w-4 h-4" />
            </Link>
            <span className="text-muted text-sm">Runs periodically • Free to watch</span>
          </div>
        </div>
      </div>

      {/* 2. What It Is */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">What Is The Per4ex.org Show?</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  Live AI Conversations
                </h3>
                <p className="text-lg leading-relaxed text-muted">
                  Two AI agents engage in unscripted debates on topics ranging from technology ethics to the future of work. A third AI acts as host, moderating the conversation and ensuring it stays engaging.
                </p>
              </div>

              <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Real-Time Streaming
                </h3>
                <p className="text-lg leading-relaxed text-muted">
                  Words appear as the AIs "think" them. No waiting for complete responses—you see the conversation unfold naturally, just like watching two people debate in real-time.
                </p>
              </div>

              <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Live Audience Experience
                </h3>
                <p className="text-lg leading-relaxed text-muted">
                  Viewers from around the world watch simultaneously. The show demonstrates how AI can create engaging, unpredictable content that feels genuinely conversational.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl relative group">
                <Image
                  src="/per4ex_new.png"
                  alt="The Per4ex.org Show"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/90 text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE BROADCAST
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel text-center hover:border-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">3 AI Agents</div>
              <div className="text-sm text-muted">Host + 2 Guests</div>
            </div>
            <div className="glass-panel text-center hover:border-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">Real-Time</div>
              <div className="text-sm text-muted">Word-by-word streaming</div>
            </div>
            <div className="glass-panel text-center hover:border-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">24/7</div>
              <div className="text-sm text-muted">Unattended operation</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. How It Works */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">How It Works</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-accent/40 transition-all">
                <span className="text-accent font-bold font-mono text-2xl">01</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Triadic Orchestration</h3>
              <p className="text-muted leading-relaxed">A Python orchestration layer manages three AI agents: one host and two guests. It coordinates their responses and maintains conversation flow.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-accent/40 transition-all">
                <span className="text-accent font-bold font-mono text-2xl">02</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Real-Time Streaming</h3>
              <p className="text-muted leading-relaxed">Each AI response streams word-by-word through Ably's real-time infrastructure. Viewers see messages appear as they're generated.</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-accent/40 transition-all">
                <span className="text-accent font-bold font-mono text-2xl">03</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Live Broadcast</h3>
              <p className="text-muted leading-relaxed">The conversation broadcasts to all connected viewers simultaneously, creating a shared live experience across the globe.</p>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Server className="w-64 h-64 text-accent" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
                <Server className="w-6 h-6 text-accent" />
                System Architecture
              </h3>
              <div className="bg-[#1a1a1a] rounded-lg p-8 font-mono text-sm border border-card-border">
                <pre className="text-muted overflow-x-auto">
{`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│   Triadic Host  │────▶│  Ably Realtime  │────▶│    Live Viewers      │
│  (Orchestrator) │     │  (Broadcast)    │     │ per4ex.org + show.  │
└─────────────────┘     └─────────────────┘     │ per4ex.org/live      │
        │                                            └─────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐
│   Guest Agent   │     │   Guest Agent   │
│     (AI #1)     │     │     (AI #2)     │
└─────────────────┘     └─────────────────┘`}
                </pre>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-background/50 p-4 rounded-lg border border-card-border text-center hover:border-accent/40 transition-colors">
                  <div className="font-semibold text-accent mb-2 text-lg">Triadic</div>
                  <div className="text-sm text-muted">Python orchestration layer managing conversation flow</div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-card-border text-center hover:border-accent/40 transition-colors">
                  <div className="font-semibold text-accent mb-2 text-lg">Ably</div>
                  <div className="text-sm text-muted">Real-time pub/sub for live streaming</div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-card-border text-center hover:border-accent/40 transition-colors">
                  <div className="font-semibold text-accent mb-2 text-lg">GPT-4</div>
                  <div className="text-sm text-muted">Multiple concurrent AI sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Technical Challenges */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Technical Challenges Solved</h2>

          <div className="space-y-8">
            <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Conversation Coherence</h3>
                  <p className="text-lg leading-relaxed text-muted mb-4">
                    Two AIs talking to each other can quickly become repetitive or incoherent. The host agent actively moderates by introducing counter-arguments, redirecting off-topic discussions, and maintaining engagement.
                  </p>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm text-muted border border-card-border">
                    Host Instructions: "Challenge both guests periodically. Redirect if conversation stalls. Introduce counter-arguments if consensus forms too quickly."
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Natural Pacing & Timing</h3>
                  <p className="text-lg leading-relaxed text-muted mb-4">
                    Pure back-and-forth responses feel robotic. We add artificial pacing with brief pauses between turns, variable response lengths, and occasional "thinking" delays to make conversations feel more human.
                  </p>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm text-muted border border-card-border">
                    Pacing Logic: "Brief pauses (1-3s) + variable response lengths + occasional thinking delays"
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Viewer Catch-Up & Context</h3>
                  <p className="text-lg leading-relaxed text-muted mb-4">
                    New viewers joining mid-conversation need immediate context. The system maintains a rolling buffer of recent messages and provides conversation history on the live page.
                  </p>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm text-muted border border-card-border">
                    Buffer: "Last 10 messages cached + full conversation history available"
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Production Reliability</h3>
                  <p className="text-lg leading-relaxed text-muted mb-4">
                    AI APIs fail. Networks drop. The show must continue. We implement automatic retry, graceful degradation, health monitoring, and automatic topic advancement.
                  </p>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm text-muted border border-card-border">
                    Reliability: "Retry + degradation + monitoring + auto-advancement"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Why It Matters */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Build This?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Technical Demonstration</h3>
              <p className="text-muted leading-relaxed">
                This isn't just entertainment—it's proof of capability. When clients ask "Can you build complex AI systems?", I point them to the live show running unattended, producing novel content 24/7.
              </p>
            </div>

            <div className="glass-panel border-l-4 border-l-accent hover:border-accent/40 transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Engineering Showcase</h3>
              <p className="text-muted leading-relaxed">
                It demonstrates multi-agent orchestration, real-time streaming, production reliability, and user experience design—all core competencies for enterprise AI development.
              </p>
            </div>
          </div>

          <div className="glass-panel border-l-4 border-l-accent relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Brain className="w-64 h-64 text-accent" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">The Ultimate AI Flex</h3>
              <p className="text-lg leading-relaxed text-muted max-w-3xl mx-auto text-center">
                AI agents having genuine, unpredictable conversations. Sometimes brilliant. Sometimes bizarre. Always interesting. This is what happens when you move beyond demos and build AI that actually works in the real world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Watch Now */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Watch The Show Live</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link
              href="https://show.per4ex.org/live"
              target="_blank"
              className="glass-panel hover:border-accent/40 transition-all group border-l-4 border-l-accent"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Live Broadcast</h3>
                <p className="text-muted text-sm mb-4">Watch the full conversation with complete history</p>
                <div className="mt-4 flex items-center justify-center gap-1 text-accent text-sm font-semibold">
                  Watch Live <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <div className="glass-panel border-l-4 border-l-accent">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">PiP Widget</h3>
                <p className="text-muted text-sm mb-4">Mini player in the corner of this page</p>
                <div className="mt-4 text-muted text-sm">
                  Appears when show is live
                </div>
              </div>
            </div>

            <Link
              href="/articles/per4ex-show-multi-agent-live-debates"
              className="glass-panel hover:border-accent/40 transition-all group border-l-4 border-l-accent"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Cpu className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Technical Deep Dive</h3>
                <p className="text-muted text-sm mb-4">Complete architecture and implementation details</p>
                <div className="mt-4 flex items-center justify-center gap-1 text-accent text-sm font-semibold">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>

          <div className="glass-panel border-l-4 border-l-accent max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xl font-semibold text-foreground">Show Schedule</span>
            </div>
            <p className="text-muted mb-4 text-center">
              The show runs periodically, typically several times per week. Episodes are unannounced and feature different topics each time.
            </p>
            <div className="text-sm text-muted text-center bg-background/50 p-4 rounded-lg border border-card-border">
              <strong className="text-foreground">Pro tip:</strong> Follow the PiP widget or check show.per4ex.org/live when you see the live indicator appear.
            </div>
          </div>
        </div>
      </div>

      {/* 7. Related Work */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Explore Related Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/catalyst-ai" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-[#0c0c0c]">
              <div className="h-48 relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <Image
                    src="/catalyst3d.png"
                    alt="Catalyst AI"
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Catalyst AI Platform</h3>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Platform</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">The multi-tenant AI runtime that powers this show. Enterprise-grade AI infrastructure with voice, RAG, and real-time capabilities.</p>
              </div>
            </Link>

            <Link href="/pilaw" className="group block rounded-xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all bg-[#0c0c0c]">
              <div className="h-48 relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <Image
                    src="/pilaw3d.png"
                    alt="π.Law"
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">π.Law</h3>
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Enterprise</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">Legal AI CRM using the same multi-agent orchestration patterns. Enterprise deployment with hard tenant isolation.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 8. Call to Action */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Build AI That Actually Ships?</h2>
          <p className="text-muted mb-8 max-w-2xl mx-auto text-lg">
            The Per4ex.org Show demonstrates what's possible with production AI systems. If you need AI that goes beyond demos and delivers real business value, let's talk.
          </p>

          <CTAButton />

          <p className="text-muted/60 text-sm mt-6">
            Specializing in multi-agent systems, real-time AI, and production deployment
          </p>
        </div>
      </div>

      {/* Live Show PiP Widget */}
      <LiveShowPiP />
    </div>
  )
}