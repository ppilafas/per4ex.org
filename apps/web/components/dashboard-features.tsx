"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, Users, Activity, Router, 
  Database, Shield, ToggleLeft, Radio, 
  BarChart3, Brain, Lock, ExternalLink
} from "lucide-react"

const FEATURES = [
  {
    id: "system",
    icon: Settings,
    title: "System Control",
    description: "The command center for the Catalyst service runtime.",
    capabilities: [
      { name: "Model Defaults", desc: "Configure default AI models, reasoning effort, and verbosity globally." },
      { name: "Feature Toggles", desc: "Hot-swap Web Search, Proactive Messaging, and Tool integrations." },
      { name: "Background Loops", desc: "Monitor proactive agents, data fetchers, and checkpoint systems." },
      { name: "Voice Ops", desc: "Manage TTS/STT providers and voice model selection." }
    ]
  },
  {
    id: "routing",
    icon: Router,
    title: "Model Routing",
    description: "Granular control over which AI models handle specific tasks.",
    capabilities: [
      { name: "Routing Profiles", desc: "Map 'Fast', 'Thinking', or 'Creative' modes to specific providers." },
      { name: "Provider Management", desc: "Configure OpenAI, Anthropic, Gemini, and Local LLM integrations." },
      { name: "Task-Based Routing", desc: "Route simple chats to cheaper models and reasoning to SOTA models." },
      { name: "Fallback Logic", desc: "Auto-switch providers if primary APIs degrade or fail." }
    ]
  },
  {
    id: "tenancy",
    icon: Users,
    title: "Tenancy & RBAC",
    description: "Enterprise-grade isolation and access management.",
    capabilities: [
      { name: "Hard Isolation", desc: "Enforce strict data separation per tenant at the database level." },
      { name: "System Prompts", desc: "Define custom instructions and guardrails per tenant." },
      { name: "Token Allowances", desc: "Set strict usage limits and quotas per user or tenant." },
      { name: "Role Management", desc: "Granular permissions for Admins, Users, and Viewers." }
    ]
  },
  {
    id: "observability",
    icon: Activity,
    title: "Observability",
    description: "Real-time insights into system performance and cost.",
    capabilities: [
      { name: "Live Traces", desc: "Watch routing decisions and AI responses stream in real-time." },
      { name: "Latency Metrics", desc: "Track TTFT (Time to First Token) and total generation time." },
      { name: "Cost Tracking", desc: "Estimate costs per request, tenant, and provider." },
      { name: "Error Analysis", desc: "Filter logs by Tenant ID, Provider, or Status Code." }
    ]
  }
]

export function DashboardFeatures() {
  const [activeFeature, setActiveFeature] = useState(FEATURES[0])

  return (
    <div className="w-full py-24 border-t border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Operational Control
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Catalyst isn't just an API—it includes a comprehensive Admin Dashboard for 
            managing tenancy, routing logic, and system observability.
          </p>
          <div className="mt-8">
            <a 
              href="https://catalyst-dashboard.per4ex.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent font-medium px-6 py-3 rounded-full border border-accent/20 transition-all duration-300 hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              Launch Admin Console
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
          {/* Feature Navigation */}
          <div className="space-y-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              const isActive = activeFeature.id === feature.id
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature)}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 group ${
                    isActive 
                      ? "bg-accent/10 border-accent/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${isActive ? "bg-accent/20 text-accent" : "bg-black/20 text-muted"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isActive ? "text-foreground" : "text-muted group-hover:text-foreground"}`}>
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted/60 mt-1 line-clamp-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Feature Detail View */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <activeFeature.icon className="w-96 h-96" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <activeFeature.icon className="w-8 h-8 text-accent" />
                  <h3 className="text-2xl font-bold text-foreground">{activeFeature.title}</h3>
                </div>

                <p className="text-lg text-muted mb-10 leading-relaxed border-l-2 border-accent/50 pl-4">
                  {activeFeature.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeFeature.capabilities.map((cap, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/5 border border-white/5 rounded-xl p-5 hover:border-accent/20 transition-colors"
                    >
                      <strong className="block text-foreground mb-2 text-sm font-bold">
                        {cap.name}
                      </strong>
                      <p className="text-sm text-muted/80 leading-relaxed">
                        {cap.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
