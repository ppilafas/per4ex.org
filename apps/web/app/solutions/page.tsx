"use client"

import { 
  MessageSquare, 
  Database, 
  Sparkles, 
  Mic, 
  FileText, 
  Bot, 
  PenTool, 
  Brain,
  ArrowRight
} from "lucide-react"

const SOLUTIONS = [
  {
    id: "ai-chat",
    icon: MessageSquare,
    title: "AI Website Chat",
    problem: "Customers expect 24/7 support, but you can't scale human agents. Generic chatbots frustrate users with scripted responses.",
    solution: "A custom AI assistant trained on your documentation, FAQs, and product knowledge. Integrates with your CRM and escalates to humans when needed.",
    stack: ["OpenAI", "LangChain", "Vercel AI SDK", "Your Backend"],
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    id: "rag",
    icon: Database,
    title: "Internal Knowledge Base (RAG)",
    problem: "Tribal knowledge scattered across Notion, Slack, Google Drive, and people's heads. New hires take months to get up to speed.",
    solution: "Unified semantic search across all your company data. Ask questions in natural language, get answers with source citations.",
    stack: ["pgvector", "LlamaIndex", "Embeddings", "SSO Integration"],
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    id: "copilot",
    icon: Sparkles,
    title: "AI Copilot for Your Product",
    problem: "Competitors are shipping AI features. Your users are asking for it. You're falling behind.",
    solution: "Embed AI capabilities directly into your existing SaaS product. From smart suggestions to natural language interfaces.",
    stack: ["OpenAI API", "Custom Fine-tuning", "Your Product API"],
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    id: "voice",
    icon: Mic,
    title: "Voice AI / Call Automation",
    problem: "Call center costs are exploding. Hold times frustrate customers. After-hours coverage is expensive.",
    solution: "Voice agents that handle inbound and outbound calls with sub-300ms latency. Human-like conversation with seamless escalation.",
    stack: ["Twilio", "Deepgram", "ElevenLabs", "Custom Orchestration"],
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  {
    id: "documents",
    icon: FileText,
    title: "Document Processing",
    problem: "Manual extraction from PDFs, invoices, and contracts. Hours of human time on repetitive data entry.",
    solution: "Automated parsing, validation, and structured data export. Handle edge cases with confidence scoring.",
    stack: ["OCR", "GPT-4 Vision", "Structured Output", "Database Sync"],
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  },
  {
    id: "agents",
    icon: Bot,
    title: "AI Workflow Agents",
    problem: "Repetitive multi-step tasks consuming human hours. Error-prone manual processes.",
    solution: "Autonomous agents that execute, verify, and report. Human-in-the-loop gates for critical decisions.",
    stack: ["LangGraph", "Tool Orchestration", "Safety Gates"],
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20"
  },
  {
    id: "content",
    icon: PenTool,
    title: "Content Generation Pipeline",
    problem: "Content bottleneck. Marketing can't keep up with demand. Scaling means scaling headcount.",
    solution: "Brand-trained generation with editorial workflow. Consistent voice, human review loop, bulk production.",
    stack: ["Fine-tuned Models", "Style Guides", "Review Workflow"],
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20"
  },
  {
    id: "training",
    icon: Brain,
    title: "Custom LLM Training",
    problem: "Generic models don't understand your domain, jargon, or proprietary processes.",
    solution: "Fine-tuned or RAG-augmented models trained on your data. Private hosting options for sensitive industries.",
    stack: ["OpenAI Fine-tuning", "LoRA", "Private Hosting"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20"
  }
]

function SolutionCard({ solution }: { solution: typeof SOLUTIONS[0] }) {
  const Icon = solution.icon
  
  return (
    <div className={`p-6 rounded-xl border ${solution.borderColor} bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col h-full`}>
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-12 h-12 rounded-xl ${solution.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${solution.color}`} />
        </div>
        <h3 className="text-xl font-bold text-foreground pt-2">{solution.title}</h3>
      </div>
      
      <div className="space-y-4 mb-6 flex-1">
        <div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">The Problem</div>
          <p className="text-sm text-muted/80 leading-relaxed">{solution.problem}</p>
        </div>
        
        <div>
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">The Solution</div>
          <p className="text-sm text-foreground/80 leading-relaxed">{solution.solution}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Tech Stack</div>
        <div className="flex flex-wrap gap-2">
          {solution.stack.map((tech) => (
            <span 
              key={tech} 
              className="px-2 py-1 text-xs rounded bg-white/5 text-muted border border-white/10"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('start-project', { 
          detail: { 
            solutionId: solution.id,
            solutionTitle: solution.title,
            problem: solution.problem,
            stack: solution.stack 
          }
        }))}
        className={`w-full py-3 rounded-lg font-bold text-sm ${solution.bgColor} ${solution.color} border ${solution.borderColor} hover:bg-opacity-20 transition-colors flex items-center justify-center gap-2 mt-auto`}
      >
        Start This Project
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function SolutionsPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <div className="text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          AI Solutions for <span className="text-accent">Real Business Problems</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Not sure where to start? These are the solutions companies are shipping right now. 
          Each one is production-ready and customized to your stack.
        </p>
      </div>
      
      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SOLUTIONS.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </div>
      
      {/* Bottom CTA */}
      <div className="text-center py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold text-foreground mb-4">Not sure which solution fits?</h2>
        <p className="text-muted mb-6 max-w-lg mx-auto">
          Describe your problem and I'll help you figure out the right approach — no commitment, just clarity.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
          className="px-8 py-4 bg-accent text-black rounded-full font-bold text-lg hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Let's Figure It Out
        </button>
      </div>
    </div>
  )
}
