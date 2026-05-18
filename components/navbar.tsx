"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { List as Menu, X } from "@phosphor-icons/react"
import { NavbarCanvas } from "./navbar-canvas"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/articles", label: "Articles" },
  { href: "/connect", label: "Connect" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollYRef = useRef(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentHash, setCurrentHash] = useState("")

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash)
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const lastScrollY = lastScrollYRef.current
      const nextVisible = !(currentScrollY > lastScrollY && currentScrollY > 100)
      setIsVisible((prev) => (prev === nextVisible ? prev : nextVisible))

      const nextScrolled = currentScrollY > 20
      setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))

      lastScrollYRef.current = currentScrollY
    }

    updateHash()
    window.addEventListener("hashchange", updateHash)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("hashchange", updateHash)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === "/#work") return pathname === "/" && currentHash === "#work"
    return pathname === href
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 border-b overflow-visible",
          isScrolled
            ? "bg-[#141414]/95 backdrop-blur-md border-white/10 shadow-lg shadow-black/20"
            : "bg-[#141414]/80 backdrop-blur-sm border-white/5"
        )}
      >
        <NavbarCanvas />

        <div className="max-w-7xl mx-auto flex items-center justify-center relative z-10">
          <Link href="/" className="hidden md:flex items-center group absolute left-0">
            <Image
              src="/supecore.png"
              alt="Supercore"
              width={160}
              height={64}
              className="h-14 md:h-16 w-auto translate-y-[1px] md:translate-y-[2px] transition-opacity group-hover:opacity-80"
              priority
            />
          </Link>

          <Link href="/" className="md:hidden flex items-center group absolute left-0">
            <Image
              src="/supecore.png"
              alt="Supercore"
              width={140}
              height={56}
              className="h-12 w-auto transition-opacity group-hover:opacity-80"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center justify-center gap-8">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-accent relative py-1",
                    active ? "text-accent" : "text-muted"
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          <button
            className="md:hidden p-2 text-foreground absolute right-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

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
                    isActive(item.href) ? "text-accent" : "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
