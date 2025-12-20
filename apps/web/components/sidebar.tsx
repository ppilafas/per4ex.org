"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", iconPath: "/avatar.png" },
  { href: "/technical-expertise", label: "Technical Expertise", iconPath: "/current_focus.png" },
  { href: "/github", label: "GitHub", iconPath: "/github.png" },
  { href: "/connect", label: "Connect", iconPath: "/authorified_scarf.png" },
  { href: "/catalyst-ai", label: "Catalyst AI", iconPath: "/catalyst.png" },
  { href: "/authored-works", label: "Authored Works", iconPath: "/parisian_author.png" },
  { href: "/pilaw", label: "π.Law Case Study", iconPath: "/current_focus.png" }, // Reusing icon for now
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col p-8 z-50 overflow-y-auto hidden md:flex">
      <div className="mb-6 w-full">
        <h3 className="text-foreground font-bold text-lg mb-4">Navigate</h3>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-full transition-colors duration-200",
                      isActive
                        ? "bg-card text-white"
                        : "text-muted hover:bg-card hover:text-white"
                    )}
                  >
                    <div className={cn(
                        "relative w-6 h-6 rounded-full overflow-hidden border border-card-border transition-all duration-200",
                        isActive ? "grayscale-0" : "grayscale"
                    )}>
                        <Image 
                            src={item.iconPath} 
                            alt={item.label}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

