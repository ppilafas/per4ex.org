"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ExternalLink } from "lucide-react"
import { NavbarCanvas } from "./navbar-canvas"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions" },
  { href: "/articles", label: "Articles" },
  { href: "/catalyst-ai", label: "Catalyst AI" },
  { href: "/silicon-smackdown", label: "Silicon Smackdown" },
  { href: "/authored-works", label: "Authored Works" },
  { href: "/connect", label: "Connect" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollYRef = useRef(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show/Hide logic
      const lastScrollY = lastScrollYRef.current
      const nextVisible = !(currentScrollY > lastScrollY && currentScrollY > 100)
      setIsVisible((prev) => (prev === nextVisible ? prev : nextVisible))

      // Background logic
      const nextScrolled = currentScrollY > 20
      setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 border-b overflow-hidden",
          isScrolled 
            ? "bg-[#141414]/95 backdrop-blur-md border-white/10 shadow-lg shadow-black/20" 
            : "bg-[#141414]/80 backdrop-blur-sm border-white/5"
        )}
      >
        {/* WebGL Background */}
        <NavbarCanvas />
        
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-lg tracking-tight font-[family-name:var(--font-display)] group-hover:text-accent transition-colors">
              per<span className="text-accent">4</span>ex<span className="text-accent">.</span>org
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent relative py-1",
                    isActive ? "text-accent" : "text-muted"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                    />
                  )}
                </Link>
              )
            })}
            <a 
              href="https://catalyst-dashboard.per4ex.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-full text-sm font-semibold transition-all border border-accent/20 hover:border-accent/40 flex items-center gap-2"
            >
              Catalyst Platform
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href="https://catalyst-chat.per4ex.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full text-sm font-semibold transition-all border border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              Catalyst Chat
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 px-6 pb-24 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-2xl font-bold",
                    pathname === item.href ? "text-accent" : "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* External links */}
              <div className="flex flex-col gap-4 pt-6 mt-2 border-t border-white/10">
                <a 
                  href="https://catalyst-dashboard.per4ex.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-4 bg-accent/10 text-accent rounded-xl text-lg font-semibold border border-accent/20"
                >
                  <span>Catalyst Platform</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a 
                  href="https://catalyst-chat.per4ex.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 px-4 bg-white/5 text-white/80 rounded-xl text-lg font-semibold border border-white/10"
                >
                  <span>Catalyst Chat</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
