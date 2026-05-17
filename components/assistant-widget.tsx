"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageSquare, X, Send, Loader2, Sparkles, Minimize2, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useRouter } from "next/navigation"
import { ConversationProvider } from "@elevenlabs/react"
import { cn } from "@/lib/utils"
import { VoicePanel } from "@/components/voice-assistant"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Message {
  role: "user" | "assistant"
  content: string
}

interface ProjectContext {
  solutionId: string
  solutionTitle: string
  problem: string
  stack: string[]
}

interface PageContext {
  path: string
  title: string
  description: string
  starter: string
  starters?: string[]
}

const STARTERS = [
  "I have a project idea",
  "What can you build for me?",
  "Show me your recent work",
  "What's your availability?",
]

const PAGE_CONTEXTS: Record<string, PageContext> = {
  "/": {
    path: "/",
    title: "Home",
    description: "A concise overview of Supercore's practical AI systems work, proof projects, approach, and contact options",
    starter: "What does Panagiotis build?",
    starters: [
      "What does Panagiotis build?",
      "Show me proof of the work",
      "Can he help with legal document AI?",
      "I have a project idea",
    ],
  },
  "/solutions": {
    path: "/solutions",
    title: "Solutions",
    description: "Supporting page with AI capabilities; the homepage is the main curated overview",
    starter: "Which capability fits my project?",
    starters: [
      "Which capability fits my project?",
      "Explain RAG in plain terms",
      "What proof projects should I see?",
      "I want to discuss a project",
    ],
  },
  "/articles": {
    path: "/articles",
    title: "Articles",
    description: "Technical blog with articles on AI, systems engineering, and best practices",
    starter: "What have you written about?",
    starters: [
      "What have you written about?",
      "Latest article on AI systems",
      "Show me technical deep-dives",
      "Articles about voice AI",
    ],
  },
  "/catalyst-ai": {
    path: "/catalyst-ai",
    title: "Catalyst AI",
    description: "Flagship assistant runtime with RAG, voice, tool calling, tenant-scoped data, and admin controls",
    starter: "How does Catalyst AI work?",
    starters: [
      "How does Catalyst AI work?",
      "What are the key features?",
      "Pricing and deployment options",
      "Can I see a demo?",
    ],
  },
  "/forensics": {
    path: "/forensics",
    title: "Forensic AI Studio",
    description: "Private evidence-analysis workspace for documents, entity mapping, audio analysis, and agent tools",
    starter: "Tell me about the Forensic AI Studio",
    starters: [
      "Tell me about the Forensic AI Studio",
      "How does the evidence analysis work?",
      "What cases has this been used for?",
      "Can this help with my case?",
    ],
  },
  "/silicon-smackdown": {
    path: "/silicon-smackdown",
    title: "Silicon Smackdown",
    description: "Real-time AI voice debate platform built for Google Gemini Developer Competition",
    starter: "How does Silicon Smackdown work?",
    starters: [
      "How does Silicon Smackdown work?",
      "What AI personalities are available?",
      "Technical architecture details",
      "Can I try it out?",
    ],
  },
  "/connect": {
    path: "/connect",
    title: "Connect",
    description: "Contact page for discussing practical AI systems projects",
    starter: "I want to discuss a project",
    starters: [
      "I want to discuss a project",
      "What's your availability?",
      "Send me your contact info",
      "Can we schedule a call?",
    ],
  },
  "/pilaw": {
    path: "/pilaw",
    title: "π.Law",
    description: "Legal AI system for case management and document search over sensitive client data",
    starter: "What is π.Law?",
    starters: [
      "What is π.Law?",
      "How does it handle sensitive data?",
      "What legal workflows could AI help?",
      "Can I discuss a legal AI project?",
    ],
  },
  "/ltbr": {
    path: "/ltbr",
    title: "Let There Be RAG",
    description: "In-development RAG SaaS concept for crawling a website and embedding a grounded chat widget",
    starter: "What is Let There Be RAG?",
    starters: [
      "What is Let There Be RAG?",
      "How would website RAG work?",
      "Is this available yet?",
      "Can I discuss a RAG project?",
    ],
  },
  "/github": {
    path: "/github",
    title: "GitHub",
    description: "Open source projects and repositories",
    starter: "Show me your open source work",
    starters: [
      "Show me your open source work",
      "Most popular repositories",
      "How can I contribute?",
      "Documentation and examples",
    ],
  },
  "/technical-expertise": {
    path: "/technical-expertise",
    title: "Technical Expertise",
    description: "Detailed technical skills and engineering capabilities",
    starter: "What are your technical specialties?",
    starters: [
      "What are your technical specialties?",
      "AI/ML stack you work with",
      "Cloud and infrastructure experience",
      "Systems architecture approach",
    ],
  },
}

const MESSAGE_LIMIT = 15

// ---------------------------------------------------------------------------
// Clickable Link Component for In-App Navigation
// ---------------------------------------------------------------------------
function ClickableLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    // Keep default browser behavior for modified clicks (new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

    const rawHref = href.trim()

    try {
      const parsedUrl = new URL(rawHref, window.location.origin)
      const isSameOrigin = parsedUrl.origin === window.location.origin

      if (isSameOrigin) {
        e.preventDefault()
        const targetPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
        router.push(targetPath)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
    } catch {
      // If URL parsing fails, fall through and open as external.
    }

    e.preventDefault()
    window.open(rawHref, "_blank", "noopener,noreferrer")
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="text-accent hover:text-accent/80 underline cursor-pointer transition-colors"
    >
      {children}
    </a>
  )
}

// Custom ReactMarkdown components for in-app links + tables
const markdownComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    if (!href) return <span>{children}</span>
    return <ClickableLink href={href}>{children}</ClickableLink>
  },
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-card-border/40">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-black/30 text-accent font-semibold">{children}</thead>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="px-2.5 py-1.5 text-left border-b border-card-border/40 whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="px-2.5 py-1.5 border-b border-card-border/20">{children}</td>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="hover:bg-white/5 transition-colors">{children}</tr>
  ),
}

// ---------------------------------------------------------------------------
// Chat-only Assistant Widget with terminal log panel
// ---------------------------------------------------------------------------
export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [mode, setMode] = useState<"text" | "voice">("text")
  const [currentPath, setCurrentPath] = useState("/")

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "System online. How can I assist you?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null)
  const projectContextRef = useRef<ProjectContext | null>(null)
  const messagesRef = useRef<Message[]>(messages)
  const messagesEndRef = useRef<HTMLDivElement>(null)


  // Get current page context
  const pageContext = PAGE_CONTEXTS[currentPath] || PAGE_CONTEXTS["/"]

  // Track current page path - robust detection for Next.js routing
  useEffect(() => {
    const updatePath = () => {
      const path = window.location.pathname
      setCurrentPath((prev) => {
        if (prev !== path) {
          addLog(`PAGE: Navigated to ${path}`)
        }
        return path
      })
    }
    
    // Initial check
    updatePath()
    
    // Listen for popstate (back/forward buttons)
    window.addEventListener("popstate", updatePath)
    
    // Next.js doesn't always trigger popstate on client navigation
    // Use MutationObserver to detect URL changes
    const observer = new MutationObserver(() => {
      const currentUrl = window.location.pathname
      setCurrentPath((prev) => {
        if (prev !== currentUrl) {
          addLog(`PAGE: Navigated to ${currentUrl}`)
          return currentUrl
        }
        return prev
      })
    })
    
    // Observe the document title (changes on route change in Next.js)
    observer.observe(document.querySelector('title') || document.head, {
      childList: true,
      subtree: true,
    })
    
    // Also check periodically as a fallback
    const interval = setInterval(updatePath, 500)
    
    return () => {
      window.removeEventListener("popstate", updatePath)
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Get conversation starters for current page
  const getStarters = useCallback((): string[] => {
    if (projectContextRef.current) {
      return [
        `Tell me about ${projectContextRef.current.solutionTitle}`,
        "What tech stack does this use?",
        "How long does implementation take?",
        "I want to start a project",
      ]
    }
    return pageContext.starters || PAGE_CONTEXTS["/"].starters || ["How can I help you?"]
  }, [pageContext])

  // Logs panel was removed; keep a no-op so existing call sites stay valid.
  const addLog = useCallback((text: string): void => {
    void text
  }, [])

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { projectContextRef.current = projectContext }, [projectContext])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  // Message count persistence
  useEffect(() => {
    const stored = sessionStorage.getItem("chat-msg-count")
    if (stored) {
      const n = parseInt(stored, 10)
      setMessageCount(n)
      if (process.env.NODE_ENV !== "development" && n >= MESSAGE_LIMIT) setIsLimitReached(true)
    }
  }, [])
  useEffect(() => { sessionStorage.setItem("chat-msg-count", messageCount.toString()) }, [messageCount])

  // ---------------------------------------------------------------------------
  // Send message via /api/chat SSE with detailed terminal logging
  // ---------------------------------------------------------------------------
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || isLimitReached) return
    if (process.env.NODE_ENV !== "development" && messageCount >= MESSAGE_LIMIT) {
      setIsLimitReached(true)
      return
    }

    const userMsg: Message = { role: "user", content: text }
    const updatedMessages = [...messagesRef.current, userMsg]
    setMessages([...updatedMessages, { role: "assistant", content: "" }])
    setIsLoading(true)

    const reqId = `req-${Math.random().toString(36).slice(2, 6)}`
    addLog(`[${reqId}] ================================`)
    addLog(`[${reqId}] USER: "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`)

    try {
      const payload: Record<string, unknown> = {
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        page_context: {
          path: currentPath,
          title: pageContext.title,
          description: pageContext.description,
        },
      }
      if (projectContextRef.current) {
        payload.solution_context = projectContextRef.current
        addLog(`[${reqId}] CTX: solution="${projectContextRef.current.solutionTitle}"`)
      }

      addLog(`[${reqId}] NET: POST /api/chat`)
      addLog(`[${reqId}] PAGE: ${currentPath} (${pageContext.title})`)
      const startTime = performance.now()

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.text().catch(() => "Unknown error")
        throw new Error(`API ${res.status}: ${err.slice(0, 120)}`)
      }

      addLog(`[${reqId}] NET: ${res.status} (headers received)`)

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let assistantContent = ""
      let chunkCount = 0
      let lastLogTs = performance.now()

      addLog(`[${reqId}] SSE: streaming started...`)

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          addLog(`[${reqId}] SSE: stream closed (chunks=${chunkCount})`)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const json = line.slice(6).trim()
          if (!json) continue
          try {
            const parsed = JSON.parse(json) as { content?: string }
            if (parsed.content) {
              assistantContent += parsed.content
              chunkCount++
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "assistant", content: assistantContent }
                return updated
              })

              // Log progress every 500ms or every 50 chunks
              const now = performance.now()
              if (now - lastLogTs > 500 || chunkCount % 50 === 0) {
                addLog(`[${reqId}] SSE: recv chunk #${chunkCount} (${assistantContent.length} chars)`)
                lastLogTs = now
              }
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      }

      const elapsed = Math.round(performance.now() - startTime)
      addLog(`[${reqId}] DONE: ${elapsed}ms | ${chunkCount} chunks | ${assistantContent.length} chars`)

      // Check if this looks like a tool was called (email sent pattern)
      if (assistantContent.toLowerCase().includes("sent your message") ||
          assistantContent.toLowerCase().includes("email sent")) {
        addLog(`[${reqId}] TOOL: send_widget_contact_email executed`)
      }

      setMessageCount((prev) => prev + 1)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error"
      addLog(`[${reqId}] ERROR: ${errMsg}`)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, something went wrong. Please try again." }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, isLimitReached, messageCount, addLog])

  // External events (open-chat, start-project)
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true)

    const handleStartProject = (e: CustomEvent<ProjectContext>) => {
      const context = e.detail
      setProjectContext(context)
      projectContextRef.current = context
      setIsOpen(true)
      const initial: Message[] = [{ role: "assistant", content: "System online. How can I assist you?" }]
      setMessages(initial)
      messagesRef.current = initial
      setMessageCount(0)
      setIsLimitReached(false)
      const projectMessage = `I'm interested in the "${context.solutionTitle}" solution. I'd like to discuss a project.`
      setTimeout(() => handleSendMessage(projectMessage), 800)
    }

    // Launcher from the homepage section: open the widget, optionally in voice
    const handleAssistantOpen = (e: CustomEvent<{ mode?: "text" | "voice" }>) => {
      setIsOpen(true)
      if (e.detail?.mode === "voice") {
        setMode("voice")
        setIsExpanded(true)
      }
    }

    window.addEventListener("open-chat", handleOpenChat)
    window.addEventListener("start-project", handleStartProject as EventListener)
    window.addEventListener("supercore:assistant", handleAssistantOpen as EventListener)
    return () => {
      window.removeEventListener("open-chat", handleOpenChat)
      window.removeEventListener("start-project", handleStartProject as EventListener)
      window.removeEventListener("supercore:assistant", handleAssistantOpen as EventListener)
    }
  }, [handleSendMessage])

  const handleOpen = () => {
    setIsOpen(true)
    setMessageCount(0)
    setIsLimitReached(false)
    sessionStorage.removeItem("chat-msg-count")
    
    // Reset with page-aware greeting
    const pageGreeting = pageContext
      ? `Hi! I see you're on the ${pageContext.title} page. ${pageContext.description}. How can I help you with this?`
      : "System online. How can I assist you?"
    setMessages([{ role: "assistant", content: pageGreeting }])
  }

  const starters = getStarters()

  // Panel dimensions
  const panelWidth = isExpanded ? "w-[680px]" : "w-[380px]"
  const panelHeight = isExpanded ? "h-[720px]" : "h-[560px]"

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-accent to-accent/90 text-black rounded-2xl shadow-2xl hover:shadow-accent/30 hover:scale-110 transition-all duration-300 z-50 border border-black/20 hover:border-black/30"
        aria-label="Toggle assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-24 right-6 bg-gradient-to-br from-background/98 via-background/96 to-background/90 backdrop-blur-2xl border border-card-border/60 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden transition-all duration-300",
              panelWidth,
              panelHeight
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-card-border/40 bg-gradient-to-r from-card/30 via-card/20 to-card/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/40 shadow-lg overflow-hidden">
                      <img src="/catalyst3d.png" alt="Assistant" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background bg-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm tracking-tight">AI Assistant</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (mode === "voice") {
                        setMode("text")
                      } else {
                        setMode("voice")
                        setIsExpanded(true)
                      }
                    }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors group",
                      mode === "voice" ? "bg-accent/20 text-accent" : "hover:bg-card/50 text-muted"
                    )}
                    title={mode === "voice" ? "Switch to text chat" : "Talk to Catalyst (voice)"}
                  >
                    {mode === "voice" ? (
                      <MessageSquare className="w-4 h-4 group-hover:text-foreground transition-colors" />
                    ) : (
                      <Mic className="w-4 h-4 group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsExpanded((v) => !v)}
                    className="p-1.5 rounded-lg hover:bg-card/50 transition-colors group"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <Minimize2 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-card/50 transition-colors group">
                    <X className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {mode === "voice" ? (
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <ConversationProvider>
                  <VoicePanel />
                </ConversationProvider>
              </div>
            ) : (
              <>
            {/* Body: chat + optional terminal */}
            <div className="flex-1 flex overflow-hidden">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                  if (!msg.content) return null
                  return (
                    <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md",
                          msg.role === "user"
                            ? "bg-gradient-to-br from-accent to-accent/90 text-black rounded-tr-md"
                            : "bg-gradient-to-br from-card via-card/80 to-card/60 border border-card-border/60 text-foreground rounded-tl-md"
                        )}
                      >
                        {msg.role === "user" ? (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : (
                          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-strong:text-white prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5 prose-code:text-accent prose-code:bg-black/30 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-a:text-accent prose-headings:text-white prose-headings:font-bold prose-headings:my-2 prose-h3:text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Page-aware conversation starters */}
                {messages.length === 1 && (
                  <div className="mt-2">
                    <div className="bg-gradient-to-r from-card/30 via-card/20 to-card/30 rounded-2xl p-3 border border-card-border/40">
                      <p className="text-xs text-foreground/70 font-medium mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" /> Suggested for {pageContext.title}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {starters.slice(0, 4).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(s)}
                            className="text-left text-xs p-2.5 rounded-xl border border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-foreground/80 hover:text-accent transition-all duration-200"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && !messages[messages.length - 1]?.content && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-card-border/60 p-3 rounded-2xl rounded-tl-md shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span className="text-xs text-muted">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Limit reached */}
                {isLimitReached && process.env.NODE_ENV !== "development" && (
                  <div className="flex justify-center">
                    <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 text-center max-w-[90%]">
                      <div className="text-accent font-bold mb-2">Session Complete</div>
                      <p className="text-muted text-xs">
                        You&apos;ve reached the {MESSAGE_LIMIT}-message limit. Close and reopen to start fresh.
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Footer: input */}
            <div className="p-4 border-t border-card-border/40 bg-gradient-to-r from-card/20 via-card/10 to-card/20 backdrop-blur-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage(input)
                  setInput("")
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLimitReached ? "Session limit reached" : "Type a message..."}
                  disabled={isLimitReached}
                  className="flex-1 bg-background/80 border border-card-border/60 rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || isLimitReached}
                  className="p-2.5 bg-accent/20 hover:bg-accent/40 disabled:bg-card-border/40 text-accent disabled:text-muted rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {!isLimitReached && process.env.NODE_ENV !== "development" && messageCount > 0 && (
                <p className="text-center text-[10px] text-muted/50 mt-2">
                  {messageCount}/{MESSAGE_LIMIT} messages
                </p>
              )}
            </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
