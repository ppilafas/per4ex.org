import Image from "next/image"
import { Mail, Code, Briefcase, Globe } from "lucide-react"
import { TypewriterSubtitle } from "@/components/typewriter"

export default function Connect() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
             <Image src="/avatar.png" alt="Connect" fill className="object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Connect</h1>
          <TypewriterSubtitle 
             text="Let's discuss systems, AI, and engineering" 
             className="mb-6 text-lg md:text-xl"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-sidebar-border pb-3">Connect</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">Email</strong>
              <a href="mailto:contact@per4ex.org" className="flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded text-foreground hover:bg-card-border transition-colors">
                 <Mail className="w-5 h-5" /> Get in touch
              </a>
           </div>

           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">GitHub</strong>
              <a href="https://github.com" target="_blank" className="flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded text-foreground hover:bg-card-border transition-colors">
                 <Code className="w-5 h-5" /> github.com
              </a>
           </div>

           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">LinkedIn</strong>
              <a href="https://linkedin.com" target="_blank" className="flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded text-foreground hover:bg-card-border transition-colors">
                 <Briefcase className="w-5 h-5" /> linkedin.com
              </a>
           </div>

           <div className="glass-panel flex flex-col items-center text-center p-6 hover:bg-card/80 transition-colors">
              <strong className="text-foreground text-lg mb-4">Website</strong>
              <a href="https://per4ex.org" className="flex items-center gap-2 bg-card border border-card-border px-4 py-2 rounded text-foreground hover:bg-card-border transition-colors">
                 <Globe className="w-5 h-5" /> per4ex.org
              </a>
           </div>
        </div>
      </div>
    </div>
  )
}

