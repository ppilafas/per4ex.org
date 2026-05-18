import Image from "next/image"
import { Envelope as Mail, Code } from "@phosphor-icons/react/ssr"
import { TypewriterSubtitle } from "@/components/typewriter"
import { CTAButton } from "@/components/cta-button"

export default function Connect() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden">
             <Image src="/avatar.png" alt="Connect" fill className="object-cover p-2" priority />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Connect</h1>
          <TypewriterSubtitle 
             text="Tell me what you are trying to build" 
             className="mb-6 text-lg md:text-xl"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-3 border-b-2 border-sidebar-border pb-3">Discuss a project</h2>
        <p className="text-muted max-w-2xl mx-auto text-center mb-8">
          Send the workflow, the data involved, who will use it, and what would make the work worth doing.
          If you prefer, open the assistant and it will collect the same context.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">Email directly</strong>
              <a href="mailto:contact@supercore.tech" className="flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded text-foreground hover:border-accent/50 transition-colors">
                 <Mail className="w-5 h-5" /> 
                 <span className="select-all">contact@supercore.tech</span>
              </a>
           </div>

           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">Use the assistant</strong>
              <CTAButton />
           </div>

           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">GitHub</strong>
              <a href="https://github.com/ppilafas" target="_blank" className="flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded text-foreground hover:bg-card-border transition-colors">
                 <Code className="w-5 h-5" /> github.com/ppilafas
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}
