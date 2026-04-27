"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import { NavbarCanvas } from "./navbar-canvas"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions" },
  { href: "/articles", label: "Articles" },
  { href: "/authored-works", label: "Authored Works" },
  { href: "/connect", label: "Connect" },
]

const productItems = [
  { href: "/catalyst-ai", label: "Catalyst AI", image: "/catalyst3d.png", scaleClass: "scale-[1.26]" },
  { href: "/forensics", label: "Forensics", image: "/detective.png", scaleClass: "scale-[1.72]" },
  { href: "/silicon-smackdown", label: "Silicon Smackdown", image: "/silicon_smacdown/big_hero_logo.png", scaleClass: "scale-[1.02]" },
  { href: "/pilaw", label: "π.Law", image: "/pilaw3d.png", scaleClass: "scale-[2.05]" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollYRef = useRef(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false)
  const isProductsActive = productItems.some((item) => pathname === item.href)

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
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 border-b overflow-visible",
          isScrolled 
            ? "bg-[#141414]/95 backdrop-blur-md border-white/10 shadow-lg shadow-black/20" 
            : "bg-[#141414]/80 backdrop-blur-sm border-white/5"
        )}
      >
        {/* WebGL Background */}
        <NavbarCanvas />
        
        <div className="max-w-7xl mx-auto flex items-center justify-center relative z-10">
          {/* Logo */}
          <Link href="/" className="hidden md:flex items-center group absolute left-0">
            <Image src="/supecore.png" alt="Supercore" width={160} height={64} className="h-14 md:h-16 w-auto translate-y-[1px] md:translate-y-[2px] transition-opacity group-hover:opacity-80" priority />
          </Link>

          <Link href="/" className="md:hidden flex items-center group absolute left-0">
            <Image src="/supecore.png" alt="Supercore" width={140} height={56} className="h-12 w-auto transition-opacity group-hover:opacity-80" priority />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {navItems.slice(0, 3).map((item) => {
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

            <div className="relative group">
              <button
                type="button"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent relative py-1 inline-flex items-center gap-1",
                  isProductsActive ? "text-accent" : "text-muted"
                )}
              >
                Products
                <ChevronDown className="w-3.5 h-3.5" />
                {isProductsActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                  />
                )}
              </button>

              <div className="absolute z-[60] top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border border-card-border/70 bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/30 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
                {productItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      pathname === item.href
                        ? "text-accent bg-accent/10"
                        : "text-muted hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    <span className="relative w-8 h-8 shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={`${item.label} thumbnail`}
                        fill
                        sizes="32px"
                        className={cn("object-contain", item.scaleClass)}
                      />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {navItems.slice(3).map((item) => {
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
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground absolute right-0"
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
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsMobileProductsOpen(false)
                  }}
                  className={cn(
                    "text-2xl font-bold",
                    pathname === item.href ? "text-accent" : "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-card-border/50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMobileProductsOpen((v) => !v)}
                  className="w-full flex items-center justify-between text-2xl font-bold"
                >
                  <span className={isProductsActive ? "text-accent" : "text-foreground"}>Products</span>
                  <ChevronDown className={cn("w-5 h-5 transition-transform", isMobileProductsOpen && "rotate-180")} />
                </button>

                {isMobileProductsOpen && (
                  <div className="mt-3 ml-3 flex flex-col gap-3">
                    {productItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          setIsMobileProductsOpen(false)
                        }}
                        className={cn(
                          "flex items-center gap-3 text-lg font-semibold",
                          pathname === item.href ? "text-accent" : "text-muted"
                        )}
                      >
                        <span className="relative w-9 h-9 shrink-0 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={`${item.label} thumbnail`}
                            fill
                            sizes="36px"
                            className={cn("object-contain", item.scaleClass)}
                          />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
