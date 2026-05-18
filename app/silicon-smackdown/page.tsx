import Image from "next/image"
import Link from "next/link"
import { Microphone as Mic, Lightning as Zap, Users, Brain, ArrowSquareOut as ExternalLink, GithubLogo as Github, Play, Radio, Cpu, ChatCircle as MessageSquare, Robot as Bot, RocketLaunch as Rocket, MagnifyingGlass as Search, Crown, Wrench, Bug, Sword, Star, Lightbulb, Atom, Flask as Beaker, Pill } from "@phosphor-icons/react/ssr"
import { TypewriterSubtitle } from "@/components/typewriter"

export default function SiliconSmackdown() {
  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <div className="flex flex-col items-center relative mb-16">
        <div className="absolute inset-0 hero-grid -z-10" />

        <div className="flex flex-col items-center z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold tracking-wide border border-purple-500/20 mb-6">
            <Radio className="w-4 h-4" />
            VOICE AI PLATFORM
          </div>

          <div className="relative w-[240px] h-[240px] mb-8 hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <Image
              src="/silicon_smacdown/big_hero_logo.png"
              alt="Silicon Smackdown"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-center text-foreground mb-6 tracking-tight">
            Silicon <span className="text-purple-400">Smackdown</span>
          </h1>

          <TypewriterSubtitle 
            text="Real-time AI talk show where legendary personalities engage in voice debates. Full-duplex audio, 20+ character pairs, powered by Gemini Live API."
            className="text-xl md:text-2xl text-muted max-w-3xl mb-10 leading-relaxed"
            cursorColor="bg-purple-400"
            speed={30}
          />

          <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
            <Link
              href="https://ssd.supercore.tech"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-all hover:scale-105 shadow-lg shadow-accent/20"
            >
              <Play className="w-5 h-5" />
              Enter the Arena
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              href="https://github.com/ppilafas/silicon_smackdown"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
            >
              <Github className="w-5 h-5" />
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live</span>
            </div>
            <span className="text-muted/60 text-sm">Password: <code className="bg-white/5 px-2 py-0.5 rounded text-accent">1999</code></span>
            <span className="text-muted text-sm">Built for Google Gemini Developer Competition</span>
          </div>
        </div>
      </div>

      {/* 2. What Makes It Special */}
      <div className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">What Makes It Special</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="glass-panel border-l-4 border-l-purple-500 hover:border-purple-400 transition-all">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                Full-Duplex Voice AI
              </h3>
              <p className="text-lg leading-relaxed text-muted mb-3">
                Real-time, low-latency voice conversations using Gemini 2.5 Flash with native audio streaming. Achieves <strong className="text-purple-400">&lt;100ms audio latency</strong> using AudioWorklet for high-performance capture.
              </p>
              <p className="text-sm text-muted/80">
                No text-to-speech intermediaries—pure voice-to-voice AI with live waveform visualization.
              </p>
            </div>

            <div className="glass-panel border-l-4 border-l-purple-500 hover:border-purple-400 transition-all">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                20+ AI Personalities
              </h3>
              <p className="text-lg leading-relaxed text-muted mb-3">
                Curated character pairs from Einstein vs. Bohr to Tony Stark vs. Peter Parker. Each with unique voices, personalities, and debate styles powered by contextual DiceBear avatars.
              </p>
              <p className="text-sm text-muted/80">
                Choose from rivalries like Logic vs. Hype, Detective & Mastermind, or The Relativist & The Quantum.
              </p>
            </div>

            <div className="glass-panel border-l-4 border-l-purple-500 hover:border-purple-400 transition-all">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Multi-Agent Orchestration
              </h3>
              <p className="text-lg leading-relaxed text-muted mb-3">
                Sophisticated state machine managing dual AI sessions with automatic turn-taking and context-aware prompting. Built with custom React hooks for modular state management.
              </p>
              <p className="text-sm text-muted/80">
                Typed reducer with useReducer ensures predictable conversation flow and prevents state bugs.
              </p>
            </div>

            <div className="glass-panel border-l-4 border-l-purple-500 hover:border-purple-400 transition-all">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Production Audio Pipeline
              </h3>
              <p className="text-lg leading-relaxed text-muted mb-3">
                Web Audio API + AudioWorklet architecture with ScriptProcessor fallback for browser compatibility. Real-time waveform analysis, audience effects, and quality indicators.
              </p>
              <p className="text-sm text-muted/80">
                Dual-channel audio routing for guest separation with automatic reconnection logic.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Technical Architecture */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Technical Architecture</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-panel text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2 font-mono">&lt;100ms</div>
              <div className="text-sm text-muted uppercase tracking-wider">Audio Latency</div>
            </div>
            <div className="glass-panel text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">1-3s</div>
              <div className="text-sm text-muted uppercase tracking-wider">AI Response Time</div>
            </div>
            <div className="glass-panel text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">50-100MB</div>
              <div className="text-sm text-muted uppercase tracking-wider">Memory Footprint</div>
            </div>
          </div>

          <div className="glass-panel space-y-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                Custom Hook Architecture
              </h3>
              <p className="text-muted leading-relaxed mb-4">
                Modular state management with focused, testable hooks that separate concerns:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background/30 p-4 rounded-lg border border-white/5">
                  <code className="text-purple-400 text-sm">useConversationState</code>
                  <p className="text-xs text-muted mt-1">Typed reducer for conversation flow</p>
                </div>
                <div className="bg-background/30 p-4 rounded-lg border border-white/5">
                  <code className="text-purple-400 text-sm">useGeminiSessions</code>
                  <p className="text-xs text-muted mt-1">Multi-session AI management</p>
                </div>
                <div className="bg-background/30 p-4 rounded-lg border border-white/5">
                  <code className="text-purple-400 text-sm">useAudioPipeline</code>
                  <p className="text-xs text-muted mt-1">Audio capture and playback</p>
                </div>
                <div className="bg-background/30 p-4 rounded-lg border border-white/5">
                  <code className="text-purple-400 text-sm">useTranscription</code>
                  <p className="text-xs text-muted mt-1">Streaming transcription updates</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                Conversation Flow
              </h3>
              <ul className="space-y-2 text-sm text-muted list-disc pl-6">
                <li><strong className="text-foreground">State Machine:</strong> Typed reducer manages guest turns, speaking states, and prompts</li>
                <li><strong className="text-foreground">Auto Turn-Taking:</strong> Guests automatically respond to each other with configurable delays</li>
                <li><strong className="text-foreground">Context Preservation:</strong> Conversation history maintained across turns</li>
                <li><strong className="text-foreground">Smart Prompting:</strong> Dynamic prompts based on conversation state</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Featured Rivalries */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Featured Rivalries</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Logic vs. Hype", char1: "Dr. Orion", icon1: Bot, char2: "Luna Nova", icon2: Rocket, theme: "Philosophy vs. Futurism" },
              { name: "Detective & Mastermind", char1: "Sherlock", icon1: Search, char2: "Moriarty", icon2: Crown, theme: "Genius vs. Criminal Mind" },
              { name: "The Genius & The Spider", char1: "Tony Stark", icon1: Wrench, char2: "Peter Parker", icon2: Bug, theme: "Mentor vs. Protégé" },
              { name: "Jedi Master & Apprentice", char1: "Master Yoda", icon1: Sword, char2: "Luke Skywalker", icon2: Star, theme: "Wisdom vs. Youth" },
              { name: "The Relativist & The Quantum", char1: "Einstein", icon1: Lightbulb, char2: "Niels Bohr", icon2: Atom, theme: "Physics Debate" },
              { name: "The Teacher & The Student", char1: "Walter White", icon1: Beaker, char2: "Jesse Pinkman", icon2: Pill, theme: "Breaking Bad Dynamics" },
            ].map((rivalry) => {
              const Icon1 = rivalry.icon1
              const Icon2 = rivalry.icon2
              return (
                <div key={rivalry.name} className="glass-panel hover:border-purple-500/40 transition-all">
                  <h3 className="text-lg font-bold text-foreground mb-3">{rivalry.name}</h3>
                  <div className="flex items-center justify-between text-sm text-muted mb-3">
                    <div className="flex items-center gap-2">
                      <Icon1 className="w-4 h-4 text-purple-400" />
                      <span>{rivalry.char1}</span>
                    </div>
                    <span className="text-purple-400/50">vs.</span>
                    <div className="flex items-center gap-2">
                      <Icon2 className="w-4 h-4 text-purple-400" />
                      <span>{rivalry.char2}</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-400">{rivalry.theme}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 5. Tech Stack */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Tech Stack</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "React 19", desc: "Concurrent features" },
              { name: "TypeScript", desc: "Type safety" },
              { name: "Gemini 2.5", desc: "Live API" },
              { name: "Web Audio", desc: "Real-time audio" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "Vite", desc: "Build tool" },
              { name: "i18next", desc: "i18n (EN/EL)" },
              { name: "DiceBear", desc: "Avatars" },
            ].map((tech) => (
              <div key={tech.name} className="glass-panel text-center">
                <div className="text-sm font-bold text-foreground mb-1">{tech.name}</div>
                <div className="text-xs text-muted">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Key Learnings */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Key Learnings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel border-l-4 border-l-accent">
              <h3 className="text-xl font-bold text-foreground mb-4">What Worked</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span><strong className="text-foreground">Custom Hook Architecture:</strong> Separating concerns made the system maintainable and testable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span><strong className="text-foreground">AudioWorklet:</strong> Reduced latency from ~200ms to &lt;100ms and eliminated glitches</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span><strong className="text-foreground">Typed State Machine:</strong> Prevented state bugs and made flow predictable</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  <span><strong className="text-foreground">Fallback Mechanisms:</strong> Auto-reconnection ensured reliability across browsers</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel border-l-4 border-l-purple-500">
              <h3 className="text-xl font-bold text-foreground mb-4">Challenges Overcome</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="text-purple-400">→</span>
                  <span><strong className="text-foreground">Turn-Taking:</strong> State machine with explicit turn management solved guests talking over each other</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400">→</span>
                  <span><strong className="text-foreground">Context Loss:</strong> Maintaining conversation history preserved context between turns</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400">→</span>
                  <span><strong className="text-foreground">Audio Echo:</strong> Headphone detection and audio routing isolation prevented feedback</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-400">→</span>
                  <span><strong className="text-foreground">Memory Leaks:</strong> Proper cleanup in useEffect hooks prevented memory growth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 7. CTA */}
      <div className="py-16 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore the Project</h2>
          <p className="text-muted mb-8">
            Dive into the code, read the full documentation, or learn more about production voice AI architecture.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://github.com/ppilafas/silicon_smackdown"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all hover:scale-105"
            >
              <Github className="w-5 h-5" />
              View Source Code
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold hover:border-accent/40 transition-all"
            >
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
