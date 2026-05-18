import { Shield, Coins, Gauge, HardDrives as Server, Lock, Cpu, GitBranch, Envelope as Mail } from "@phosphor-icons/react/ssr"
import { CTAButton } from "@/components/cta-button"

export const metadata = {
  title: "Private AI on Your Own Infrastructure | supercore.tech",
  description:
    "Self-hosted LLM inference for teams that can't (or won't) send data to a third-party API. On-prem and private-cloud AI for compliance, cost control at scale, and predictable latency. vLLM, quantization, GPU sizing, private RAG.",
}

export default function PrivateAIPage() {
  return (
    <div className="space-y-0">

      {/* ── Hero ── */}
      <div className="relative pt-8 pb-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 hero-grid -z-10 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-widest border border-accent/20 mb-8 uppercase">
            <Lock className="w-3 h-3" />
            Self-Hosted LLM Inference
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight leading-none">
            Run powerful AI on<br />
            <span className="text-accent">your own infrastructure</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            For teams that <strong className="text-foreground">can&apos;t</strong> — or <strong className="text-foreground">won&apos;t</strong> — pipe their data through a third-party AI API. I design and deploy private LLM inference: on-prem or in your own cloud, your data never leaving your boundary.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <CTAButton />
            <a
              href="mailto:contact@supercore.tech?subject=Private%20AI%20inference%20enquiry"
              className="inline-flex items-center justify-center gap-2 bg-card border border-card-border text-foreground px-6 py-3 rounded-lg hover:border-accent/50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Or email me directly
            </a>
          </div>
          <p className="text-xs text-muted mt-4">The assistant can answer questions about a private deployment and take your details.</p>
        </div>
      </div>

      {/* ── The three drivers ── */}
      <div className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3 text-center">Why teams self-host</h2>
          <p className="text-muted text-center mb-12 max-w-2xl mx-auto">
            There are three reasons companies move inference off a public API. Usually it&apos;s one of them sharply — sometimes all three.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Compliance & data residency",
                desc: "Customer data that legally can't leave your infrastructure — GDPR, healthcare, legal, fintech. Self-hosted inference keeps every token inside your boundary, with an auditable data path.",
              },
              {
                icon: Coins,
                title: "Cost at scale",
                desc: "Per-token API pricing is fine until volume makes it the largest line item. Owned or rented GPUs flip the economics past a break-even point — the question is where that point is for you, and I'll model it honestly.",
              },
              {
                icon: Gauge,
                title: "Latency & control",
                desc: "No rate limits, no surprise deprecations, no noisy-neighbour latency. Predictable performance you tune, and a model that doesn't change underneath you unless you change it.",
              },
            ].map((d) => (
              <div key={d.title} className="glass-panel hover:border-accent/40 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <d.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{d.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What the engagement covers ── */}
      <div className="py-20 px-6 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3 text-center">What I actually do</h2>
          <p className="text-muted text-center mb-12 max-w-2xl mx-auto">
            Not advice — a working deployment. From model selection to a system your team can run without me.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Cpu,
                title: "Model & hardware sizing",
                desc: "Which open model fits your task and your constraints, quantization strategy, and the GPU/VRAM footprint to run it at your throughput target — sized to real numbers, not guesses.",
              },
              {
                icon: Server,
                title: "Production inference serving",
                desc: "vLLM (or the right server for the workload), batching and concurrency tuned for your traffic, deployed on-prem or in your private cloud. Built to be operated, not babysat.",
              },
              {
                icon: Lock,
                title: "Private RAG & assistants",
                desc: "Retrieval and assistant layers over your own documents, where the embeddings, the vector store, and the model all stay inside your boundary.",
              },
              {
                icon: GitBranch,
                title: "Honest build-vs-buy call",
                desc: "If a hosted API is genuinely the right answer for you, I'll say so and tell you why. The break-even math comes before the build.",
              },
            ].map((c) => (
              <div key={c.title} className="glass-panel hover:border-accent/40 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <c.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Is self-hosting right for you?</h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            Tell me the workload, the data involved, and the constraint that&apos;s pushing you off a public API. You&apos;ll get a straight answer on whether self-hosting is worth it for your case — and what it would take.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <CTAButton />
            <a
              href="mailto:contact@supercore.tech?subject=Private%20AI%20inference%20enquiry"
              className="inline-flex items-center justify-center gap-2 bg-card border border-card-border text-foreground px-6 py-3 rounded-lg hover:border-accent/50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              contact@supercore.tech
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
