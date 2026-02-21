"use client"

import { Database, Bot, Mic, Activity, Layers } from "lucide-react"

const SOLUTIONS = [
  {
    icon: Database,
    title: "Enterprise RAG",
    description: "Connect LLMs to your private data with vector search. Built for accuracy and citation."
  },
  {
    icon: Bot,
    title: "Autonomous Agents",
    description: "Systems that reason, plan, and execute complex workflows to automate processes."
  },
  {
    icon: Mic,
    title: "Realtime Voice AI",
    description: "Sub-300ms latency voice interfaces with human-like turn-taking."
  },
  {
    icon: Activity,
    title: "LLM Ops & Eval",
    description: "Observability, cost tracking, and guardrails to run AI safely in production."
  }
]

export function SolutionsGrid() {
  return (
    <div className="w-full py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-3">What I Build</h2>
          <p className="text-muted max-w-xl mx-auto">
            High-demand AI capabilities deployed on the stack that fits your infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SOLUTIONS.map((sol, idx) => {
            const Icon = sol.icon
            return (
              <div 
                key={idx}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">{sol.title}</h3>
                <p className="text-sm text-muted/80 leading-relaxed">{sol.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 py-6 px-8 rounded-xl border border-white/5 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-accent/80 text-xs font-bold tracking-widest uppercase">
              <Layers className="w-3 h-3" />
              <span>Stack Agnostic</span>
            </div>
            <p className="text-muted max-w-2xl mx-auto">
              I ship on <span className="text-foreground">LangChain</span>, <span className="text-foreground">LlamaIndex</span>, and <span className="text-foreground">Vercel AI SDK</span> — or build custom runtimes when your use case demands it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
