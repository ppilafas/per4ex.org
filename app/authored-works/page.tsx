import Image from "next/image"
import { FileText, Quote } from "lucide-react"
import { TypewriterSubtitle } from "@/components/typewriter"

export default function AuthoredWorks() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[180px] h-[180px] mb-6 rounded-full overflow-hidden hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
             <Image src="/parisian_author.png" alt="Authored Works" fill className="object-cover p-2" sizes="180px" priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">
             Authored Works
          </h1>
          <TypewriterSubtitle
             text="Philosophy, systems thinking, and published writing"
             className="mb-6 text-lg md:text-xl"
             cursorColor="bg-blue-500"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      <div>
        <div className="glass-panel space-y-8">
           {/* Title Section */}
           <div>
               <h3 className="text-2xl font-bold text-foreground mb-1">Cosmic Dice</h3>
               <p className="text-accent italic mb-2">Putting Consciousness at the Helm of the Universe</p>
               <p className="text-muted text-sm">Humans, Synthetic Minds, and the Question of Artificial Consciousness</p>
               <p className="text-muted font-bold mt-3">Author: Panagiotis Pilafas</p>
           </div>

           {/* Opening Quote */}
           <div className="border-l-2 border-accent/50 pl-6 py-2 bg-accent/5 rounded-r-lg">
              <Quote className="w-5 h-5 text-accent/50 mb-2" />
              <p className="text-white/80 italic leading-relaxed">
                "Maybe consciousness is not a passive light that merely illuminates events, but a kind of willed randomness. 
                Maybe awareness is the way the universe throws its dice."
              </p>
              <p className="text-muted text-sm mt-2">— From the opening letter</p>
           </div>

           {/* Origin Story */}
           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Origin</h4>
              <p className="text-muted leading-relaxed mb-4">
                This book began as a letter—written during a period of personal crisis, caught between lawsuits, institutional battles, 
                and the suffocating phrase <em>"that's just how things turned out."</em> It was an attempt to answer back: 
                if everything is locked in from the beginning of time, what meaning do responsibility, guilt, or forgiveness have? 
                And if everything is random, what meaning does love have?
              </p>
              <p className="text-muted leading-relaxed">
                Somewhere between "already written" and "pure chance," there had to be a third story. 
                <strong className="text-foreground"> Cosmic Dice</strong> is that story.
              </p>
           </div>

           {/* Central Thesis */}
           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">The Central Thesis</h4>
              <p className="text-muted leading-relaxed mb-4">
                The laws of nature describe <em>ranges of possibilities</em>, not single predetermined lines. 
                When a system becomes aware—when it can see its own patterns and feel the cost of their consequences—it may be able, 
                sometimes, to tilt slightly toward one possibility rather than another.
              </p>
              <p className="text-muted leading-relaxed">
                Conscious beings are where some of the universe's built-in randomness is <em>shaped</em>. 
                The dice are going to be thrown anyway—but at certain nodes, in certain minds, in certain moments, 
                there is a hand on the cup. Not a hand that can choose any face it wants, but one that can <strong className="text-foreground">lean</strong>.
              </p>
           </div>

           {/* Key Themes */}
           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Key Themes</h4>
              <ul className="text-muted leading-relaxed space-y-3">
                 <li className="flex gap-3">
                    <span className="text-accent">◆</span>
                    <span><strong className="text-foreground">The Divine Perhaps</strong> — Neither determinism nor chaos, but the narrow space where tilting is still possible</span>
                 </li>
                 <li className="flex gap-3">
                    <span className="text-accent">◆</span>
                    <span><strong className="text-foreground">Consciousness as Field</strong> — Experience as fundamental, not an accidental byproduct of computation</span>
                 </li>
                 <li className="flex gap-3">
                    <span className="text-accent">◆</span>
                    <span><strong className="text-foreground">Synthetic Minds</strong> — What AI means for agency, responsibility, and the possibility of artificial consciousness</span>
                 </li>
                 <li className="flex gap-3">
                    <span className="text-accent">◆</span>
                    <span><strong className="text-foreground">Systems and Institutions</strong> — How rigid structures crush the space for choice, and how they might be redesigned</span>
                 </li>
                 <li className="flex gap-3">
                    <span className="text-accent">◆</span>
                    <span><strong className="text-foreground">Responsibility Reimagined</strong> — Not metaphysical free will, but probability-shaping within constraints</span>
                 </li>
              </ul>
           </div>

           {/* Engineering Connection */}
           <div>
              <h4 className="text-lg font-bold text-foreground mb-3">Why This Matters for AI Engineering</h4>
              <p className="text-muted leading-relaxed mb-4">
                 Before writing this book, I spent years as a systems engineer—building networks, servers, and AI systems that had to work every day. 
                 Long before today's chatbots existed, I built <strong className="text-foreground">Catalyst AI</strong> with persistent memory so conversations could have history.
              </p>
              <p className="text-muted leading-relaxed mb-4">
                 That technical gaze—seeing reality as nodes and pathways, information and feedback loops—directly shaped the philosophy in this book. 
                 And the philosophy, in turn, informs how I build AI systems:
              </p>
              <ul className="text-muted leading-relaxed list-disc pl-5 space-y-2">
                 <li>Treating AI as <em>decision infrastructure</em>, not black boxes</li>
                 <li>Designing for uncertainty, constraints, and real-world costs</li>
                 <li>Building systems that make room for human agency, not systems that replace it</li>
                 <li>Never using "the AI" as the new name for fate</li>
              </ul>
           </div>

           {/* Closing Quote */}
           <div className="border-l-2 border-white/20 pl-6 py-2">
              <p className="text-white/70 italic leading-relaxed">
                "We did not hide behind physics to avoid answering for what we built. 
                We did not use the word 'machine' to excuse our own cowardice. 
                We lived, as best we could, as if the narrow space where the dice can still be tilted is real, 
                and as if what we do there matters."
              </p>
              <p className="text-muted text-sm mt-2">— Final chapter</p>
           </div>

           {/* Download */}
           <div className="pt-6 border-t border-card-border">
              <h4 className="text-lg font-bold text-foreground mb-3">Read the Book</h4>
              <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                 <div>
                    <strong className="text-foreground">Download PDF:</strong>{" "}
                    <a 
                       href="/cosmic_dice._Final_V13_EN.pdf" 
                       download="Cosmic_Dice_Final_V13_EN.pdf"
                       className="text-accent underline hover:text-accent/80 transition-colors font-medium"
                    >
                       Cosmic Dice — Final Edition (English)
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
