import Image from "next/image"
import { TypewriterSubtitle } from "@/components/typewriter"

export default function AuthoredWorks() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
             <Image src="/parisian_author.png" alt="Authored Works" fill className="object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">
             Authored Works
          </h1>
          <TypewriterSubtitle 
             text="Philosophy, systems thinking, and published writing" 
             className="mb-6 text-lg md:text-xl"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      <div>
        <div className="glass-panel space-y-6">
           <div>
               <h3 className="text-2xl font-bold text-foreground mb-1">Cosmic Dice</h3>
               <p className="text-muted italic mb-2">Putting Consciousness at the Helm of the Universe</p>
               <p className="text-muted text-sm">Book · Systems Philosophy · AI & Agency</p>
               <p className="text-muted font-bold mt-2">Author: Panagiotis Pilafas</p>
           </div>

           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Overview</h4>
              <p className="text-muted leading-relaxed mb-4">
                Cosmic Dice is a systems-level exploration of agency, responsibility, and probabilistic decision-making in humans, institutions, and artificial intelligence.
                It treats minds—human and synthetic—not as deterministic machines or mystical exceptions, but as probabilistic systems operating within constrained landscapes of possibility.
              </p>
              <p className="text-muted leading-relaxed">
                The book connects modern physics, cognitive science, philosophy, and AI into a single conceptual framework, focusing on how choice, responsibility, and meaning remain possible in a world governed by laws, uncertainty, and stochastic computation.
              </p>
           </div>

           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Key Themes</h4>
              <ul className="text-muted leading-relaxed list-disc pl-5 space-y-2">
                 <li>Minds as probabilistic systems, not deterministic scripts</li>
                 <li>Willed randomness: constrained agency within stochastic processes</li>
                 <li>Consciousness as a field of experience, not a control mechanism</li>
                 <li>Artificial intelligence as shared socio-technical systems, not isolated tools</li>
                 <li>Responsibility as probability-shaping, not metaphysical free will</li>
              </ul>
           </div>

           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Relevance to My Engineering Work</h4>
              <p className="text-muted leading-relaxed mb-4">
                 The ideas developed in Cosmic Dice directly inform how I design agentic AI systems, including:
              </p>
              <ul className="text-muted leading-relaxed list-disc pl-5 space-y-2">
                 <li>Explicit agent state and control flow</li>
                 <li>Cost-aware and uncertainty-aware model orchestration</li>
                 <li>Retrieval-augmented systems with long-term memory</li>
                 <li>Tool-augmented agents operating under real-world constraints</li>
                 <li>AI systems viewed as decision infrastructures, not black boxes</li>
              </ul>
              <p className="text-muted leading-relaxed mt-4">
                 This work provides the conceptual foundation behind projects like <strong className="text-foreground">Catalyst AI</strong>, where probabilistic models, tools, memory, and human interaction are treated as parts of a single, coherent system.
              </p>
           </div>

           <div className="pt-6 border-t border-card-border">
              <h4 className="text-lg font-bold text-foreground mb-3">Links</h4>
              <ul className="space-y-3">
                 <li>
                    📘 <strong className="text-foreground">Read the book (PDF):</strong>{" "}
                    <a href="https://per4ex.org/cosmic-dice" className="text-foreground underline hover:text-muted transition-colors">per4ex.org/cosmic-dice</a>
                 </li>
                 <li>
                    🧠 <strong className="text-foreground">Related system: Catalyst AI:</strong>{" "}
                    <a href="https://github.com/ppilafas/catalyst-swift-app" className="text-foreground underline hover:text-muted transition-colors">github.com/ppilafas/catalyst-swift-app</a>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  )
}
