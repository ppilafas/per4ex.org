import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Mail, Shield, Wrench } from "lucide-react"
import { CTAButton } from "@/components/cta-button"
import { VoiceAssistantMount } from "@/components/voice-assistant-mount"

const helpItems = [
  {
    title: "Turn messy knowledge into usable AI",
    description:
      "RAG systems for documents, websites, support notes, legal material, and internal knowledge bases.",
    details: "pgvector, hybrid search, citation grounding, reranking",
  },
  {
    title: "Build assistants that can take action",
    description:
      "Chat and voice assistants that call tools, remember context, and work inside real business workflows.",
    details: "function calling, MCP, workflow gates, audit trails",
  },
  {
    title: "Move prototypes into production",
    description:
      "The less glamorous work that makes AI useful: auth, tenant isolation, streaming, logs, costs, and failure handling.",
    details: "Next.js, FastAPI, Postgres, Vercel, Fly.io, local GPUs",
  },
  {
    title: "Use the right model stack for the job",
    description:
      "OpenAI, Gemini, Hugging Face, or self-hosted inference, chosen around latency, privacy, cost, and control.",
    details: "LLM routing, vLLM, llama.cpp, Whisper, TTS",
  },
]

const proofItems = [
  {
    title: "Catalyst AI",
    href: "/catalyst-ai",
    image: "/catalyst3d.png",
    label: "Flagship runtime",
    summary:
      "A shared assistant platform with RAG, voice, tool calling, tenant-scoped data, and admin controls.",
    proof: "Used as the base runtime behind multiple products and the site assistant.",
  },
  {
    title: "π.Law",
    href: "/pilaw",
    image: "/pilaw3d.png",
    label: "Legal AI",
    summary:
      "A legal case-management and document-search system designed around sensitive client data.",
    proof: "Uses a proxy boundary, Postgres search, and Catalyst for AI reasoning over legal material.",
  },
  {
    title: "Forensic AI Studio",
    href: "/forensics",
    image: "/detective.png",
    label: "Investigation tools",
    summary:
      "A private evidence-analysis workspace for searching documents, mapping entities, and analyzing audio.",
    proof: "Built under real legal constraints with document ingestion, vector search, and agent tools.",
  },
  {
    title: "Silicon Smackdown",
    href: "/silicon-smackdown",
    image: "/silicon_smacdown/big_hero_logo.png",
    label: "Voice AI",
    summary:
      "A real-time AI talk-show experiment with multiple voice personalities and live conversation flow.",
    proof: "Demonstrates low-latency audio, WebSocket orchestration, and Gemini Live API work.",
  },
]

const principles = [
  "Start with the business workflow, not the model demo.",
  "Keep private data scoped, logged, and deliberately exposed.",
  "Prefer boring infrastructure where reliability matters.",
  "Ship small, measure behavior, and harden what proves useful.",
]

export default function Home() {
  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 hero-grid -z-10 opacity-70" />
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-accent">
            Supercore · AI systems engineering
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Practical AI systems for teams with real data, real users, and real constraints.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            I help turn AI ideas into working software: knowledge systems, assistants, voice
            interfaces, and the infrastructure needed to run them without drama.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTAButton />
            <Link
              href="mailto:contact@supercore.tech"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-bold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              contact@supercore.tech
            </Link>
          </div>
        </div>
      </section>

      <VoiceAssistantMount />

      <section id="help" className="scroll-mt-28 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
              What I help with
            </p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Useful AI, wired into the systems people already depend on.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {helpItems.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted">{item.description}</p>
                <p className="text-xs text-muted/70">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-28 border-y border-white/5 bg-[#0a0a0a] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
                Proof of work
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                A few systems that show the range.
              </h2>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80"
            >
              Read field notes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {proofItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group grid grid-cols-[96px_1fr] gap-5 rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-accent/40 md:grid-cols-[132px_1fr]"
              >
                <div className="relative h-24 overflow-hidden rounded-lg bg-black/30 md:h-32">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="132px"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-accent">
                      {item.title}
                    </h3>
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {item.label}
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-muted">{item.summary}</p>
                  <p className="text-xs leading-relaxed text-muted/70">{item.proof}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="approach" className="scroll-mt-28 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
              How I work
            </p>
            <h2 className="mb-5 text-3xl font-bold text-foreground">
              Less theatre. More working software.
            </h2>
            <p className="mb-5 text-base leading-relaxed text-muted">
              I am useful when the problem has messy inputs, sensitive data, awkward integrations,
              or unclear production constraints. The goal is not to add AI everywhere. The goal is
              to make one important workflow faster, safer, or easier to operate.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div key={principle} className="flex gap-3 rounded-lg bg-black/20 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm leading-relaxed text-muted">{principle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-7">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">Good fits</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Bring a workflow, dataset, or product idea where generic chatbot wrappers are not enough.
            </p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Legal, evidence, support, or internal knowledge workflows</li>
              <li>Assistants that need tools, memory, or integrations</li>
              <li>Voice or real-time interfaces with latency constraints</li>
              <li>AI systems that need privacy, observability, or cost control</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 border-t border-white/5 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
            Contact
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Tell me what you are trying to build.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted">
            A useful first message includes the workflow, the data involved, who will use it,
            and what would make the project worth doing.
          </p>
          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTAButton />
            <Link
              href="mailto:contact@supercore.tech"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-bold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              Email directly
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 text-left text-sm text-muted sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              What exists today?
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              What data or systems are involved?
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              What would success look like?
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
