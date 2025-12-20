"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/", label: "Home", iconPath: "/avatar.png" },
  { href: "/technical-expertise", label: "Technical Expertise", iconPath: "/current_focus.png" },
  { href: "/github", label: "GitHub", iconPath: "/github.png" },
  { href: "/connect", label: "Connect", iconPath: "/authorified_scarf.png" },
  { href: "/catalyst-ai", label: "Catalyst AI", iconPath: "/catalyst.png" },
  { href: "/authored-works", label: "Authored Works", iconPath: "/parisian_author.png" },
  { href: "/pilaw", label: "π.Law Case Study", iconPath: "/current_focus.png" },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-sidebar-border">
      <span className="font-bold text-lg">Per4ex.org</span>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground hover:bg-card rounded-md transition-colors"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-sidebar border-b border-sidebar-border shadow-2xl overflow-hidden"
          >
            <nav className="p-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-card text-white"
                        : "text-muted hover:bg-card hover:text-white"
                    )}
                  >
                    <div className={cn(
                        "relative w-6 h-6 rounded-full overflow-hidden border border-card-border",
                        isActive ? "grayscale-0" : "grayscale"
                    )}>
                        <Image 
                            src={item.iconPath} 
                            alt={item.label}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

