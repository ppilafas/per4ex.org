"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageSquare, X, Send, Loader2, Sparkles, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { 
  getCatalystSessionId, 
  setCatalystSessionId, 
  hasActiveSession,
  refreshSessionTimestamp 
} from "@/lib/chat-session"

// Custom hook to coordinate widget states
function useWidgetState(widgetType: 'chat' | 'voice') {
  const [isOpen, setIsOpen] = useState(false)

  // Load initial state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('per4ex-widget-state')
    if (stored) {
      const state = JSON.parse(stored)
      setIsOpen(state[widgetType] || false)
    }
  }, [widgetType])

  // Update localStorage when state changes
  const setWidgetOpen = (open: boolean) => {
    const currentState = JSON.parse(localStorage.getItem('per4ex-widget-state') || '{}')
    const newState = { ...currentState }

    // If opening this widget, close the other one
    if (open) {
      newState.chat = widgetType === 'chat' ? true : false
      newState.voice = widgetType === 'voice' ? true : false
    } else {
      newState[widgetType] = false
    }

    localStorage.setItem('per4ex-widget-state', JSON.stringify(newState))

    // Dispatch custom event for same-tab synchronization
    window.dispatchEvent(new CustomEvent('widgetStateChange', { detail: newState }))

    // Update both widgets' states
    setIsOpen(newState[widgetType])
  }

  return [isOpen, setWidgetOpen] as const
}

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

const STARTERS = [
  "I have a project idea",
  "What can you build for me?",
  "Show me your recent work",
  "What's your availability?",
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useWidgetState('chat')

  // Check current page for positioning
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "System online. Catalyst Agent ready. How can I assist you with this portfolio?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hasExistingSession, setHasExistingSession] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null)
  
  // Message limit configuration - increased to accommodate agentic workflows
  const MESSAGE_LIMIT = 15
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>(messages)
  const projectContextRef = useRef<ProjectContext | null>(projectContext)
  
  // Keep refs in sync with state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  
  useEffect(() => {
    projectContextRef.current = projectContext
  }, [projectContext])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load message count from sessionStorage on mount (per-session, not persistent)
  useEffect(() => {
    const storedCount = sessionStorage.getItem('catalyst-chat-count')
    if (storedCount) {
      const count = parseInt(storedCount, 10)
      setMessageCount(count)
      if (process.env.NODE_ENV !== 'development' && count >= MESSAGE_LIMIT) {
        setIsLimitReached(true)
      }
    }
  }, [])

  // Restore Catalyst session on mount
  useEffect(() => {
    const existingSessionId = getCatalystSessionId()
    if (existingSessionId) {
      setSessionId(existingSessionId)
      setHasExistingSession(true)
      console.log('Restored existing Catalyst session:', existingSessionId)
    }
  }, [])

  // Listen for widget state changes from other widgets
  useEffect(() => {
    const handleStateChange = (state: any) => {
      const newIsOpen = state.chat || false
      if (newIsOpen !== isOpen) {
        // If another widget opened, close this one
        if (newIsOpen && !state.chat) {
          setIsOpen(false)
        }
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'per4ex-widget-state') {
        const state = JSON.parse(e.newValue || '{}')
        handleStateChange(state)
      }
    }

    const handleCustomEvent = (e: CustomEvent) => {
      handleStateChange(e.detail)
    }

    const handleOpenChat = () => {
      console.log('Received open-chat event');
      setIsOpen(true)
    }

    const handleStartProject = (e: CustomEvent<ProjectContext>) => {
      console.log('Received start-project event:', e.detail);
      const context = e.detail
      setProjectContext(context)
      setIsOpen(true)
      
      // Reset messages
      const initialMessages: Message[] = [
        { role: "assistant", content: "System online. Catalyst Agent ready. How can I assist you with this portfolio?" }
      ]
      setMessages(initialMessages)
      
      // Update refs immediately since useEffects won't fire until next render
      projectContextRef.current = context
      messagesRef.current = initialMessages
      
      // Auto-send the project inquiry after a short delay
      const projectMessage = `I'm interested in the "${context.solutionTitle}" solution. I'd like to discuss a project.`
      setTimeout(() => {
        console.log('Auto-sending project message:', projectMessage);
        // Call the direct send function
        const userMessage: Message = { role: "user", content: projectMessage }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)
        setMessages(prev => [...prev, { role: "assistant", content: "" }])
        
        // Make the API call
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: [...initialMessages, userMessage].filter(m => m.content.trim() !== "").map(m => ({ role: m.role, content: m.content })),
            session_id: null,
            solution_context: context
          }),
        }).then(async response => {
          if (!response.body) throw new Error("No response body")
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let assistantMessage = ""
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const dataStr = line.slice(6)
                  if (!dataStr.trim()) continue
                  const data = JSON.parse(dataStr)
                  if (data.content || data.text) {
                    assistantMessage += (data.content || data.text || "")
                  }
                  setMessages(prev => {
                    const newArr = [...prev]
                    if (assistantMessage) {
                      newArr[newArr.length - 1] = { role: "assistant", content: assistantMessage }
                    }
                    return newArr
                  })
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }
        }).catch(error => {
          console.error("Auto-send error:", error)
          setMessages(prev => {
            const newArr = [...prev]
            newArr[newArr.length - 1] = { role: "assistant", content: "Sorry, there was an error. Please try again." }
            return newArr
          })
        }).finally(() => {
          setIsLoading(false)
          // Keep projectContext active throughout the conversation
          // It will be cleared when widget closes or a new project intake starts
        })
      }, 200)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('widgetStateChange', handleCustomEvent as EventListener)
    window.addEventListener('open-chat', handleOpenChat)
    window.addEventListener('start-project', handleStartProject as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('widgetStateChange', handleCustomEvent as EventListener)
      window.removeEventListener('open-chat', handleOpenChat)
      window.removeEventListener('start-project', handleStartProject as EventListener)
    }
  }, [isOpen, setIsOpen])

  // Save message count to sessionStorage when it changes (per-session, resets on tab close)
  useEffect(() => {
    sessionStorage.setItem('catalyst-chat-count', messageCount.toString())
  }, [messageCount])

  // Reset session when widget opens for a fresh conversation
  const handleOpenWidget = () => {
    setIsOpen(true)
    // Reset count on widget open for fresh sessions
    setMessageCount(0)
    setIsLimitReached(false)
    sessionStorage.removeItem('catalyst-chat-count')
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || isLimitReached) return

    // Check message limit (skip in development)
    if (process.env.NODE_ENV !== 'development' && messageCount >= MESSAGE_LIMIT) {
      setIsLimitReached(true)
      return
    }

    const userMessage: Message = { role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Add placeholder for assistant response
    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    try {
      // Refresh session timestamp on user activity
      refreshSessionTimestamp()
      
      // If we have an existing session, send only the latest message
      // Catalyst will manage the full context history server-side
      const messagesToSend = hasExistingSession && sessionId
        ? [{ role: userMessage.role, content: userMessage.content }]
        : messages
            .filter(msg => msg.content.trim() !== "")
            .concat([userMessage])
            .map(msg => ({ role: msg.role, content: msg.content }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            messages: messagesToSend,
            session_id: sessionId,
            solution_context: projectContext // Pass project context for intake flow
        }),
      })

      if (!response.body) throw new Error("No response body")
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        
        for (const line of lines) {
            if (line.startsWith("data: ")) {
                try {
                    const dataStr = line.slice(6)
                    if (!dataStr.trim()) continue;

                    const data = JSON.parse(dataStr)

                    // 1. Metadata / Session Init
                    if (data.session_id && !sessionId) {
                        setSessionId(data.session_id)
                        setCatalystSessionId(data.session_id) // Persist to sessionStorage
                        setHasExistingSession(true)
                        console.log('New Catalyst session created:', data.session_id)
                        continue
                    }

                    // 2. Standard Text Streaming
                    if (data.content || data.text) {
                        assistantMessage += (data.content || data.text || "")
                    }
                    
                    // Update UI
                    setMessages(prev => {
                        const newArr = [...prev]
                        if (assistantMessage) {
                            newArr[newArr.length - 1] = { role: "assistant", content: assistantMessage }
                        }
                        return newArr
                    })

                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
      }

      // Increment message count on successful send
      setMessageCount(prev => prev + 1)

    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => {
         const newArr = [...prev]
         newArr[newArr.length - 1] = { role: "assistant", content: "Error: Unable to connect to Catalyst Service." }
         return newArr
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
    setInput("")
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => isOpen ? setIsOpen(false) : handleOpenWidget()}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-accent to-accent/90 text-black rounded-2xl shadow-2xl hover:shadow-accent/30 hover:scale-110 transition-all duration-300 z-50 border border-black/20 hover:border-black/30"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed w-[380px] h-[520px] bg-gradient-to-br from-background/98 via-background/96 to-background/90 backdrop-blur-2xl border border-card-border/60 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden",
              currentPath === '/catalyst-ai' ? "bottom-24 left-6" : "bottom-24 right-6"
            )}
          >
            {/* Header */}
            <div className="p-5 border-b border-card-border/40 bg-gradient-to-r from-card/30 via-card/20 to-card/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/40 shadow-lg overflow-hidden">
                      <img 
                        src="/catalyst3d.png" 
                        alt="Catalyst" 
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base tracking-tight">Catalyst Chat</h3>
                    <p className="text-xs text-muted/80 font-medium">
                      System Online
                    </p>
                  </div>
               </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-card/50 transition-colors group"
                  title="Close Chat"
                >
                  <Minimize2 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
               </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map((msg, idx) => {
                  if (!msg.content) return null; // Don't render empty placeholder bubbles
                  return (
                    <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                     <div className={cn(
                          "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg",
                          msg.role === "user"
                             ? "bg-gradient-to-br from-accent to-accent/90 text-black rounded-tr-md ml-auto whitespace-pre-wrap"
                             : "bg-gradient-to-br from-card via-card/80 to-card/60 border border-card-border/60 text-foreground rounded-tl-md"
                     )}>
                          {msg.role === "user" ? (
                            msg.content
                          ) : (
                            <div className="prose prose-sm prose-invert max-w-none
                              prose-p:my-1 prose-p:leading-relaxed
                              prose-strong:text-white prose-strong:font-semibold
                              prose-em:text-white/80
                              prose-ul:my-1.5 prose-ul:pl-4 prose-li:my-0.5
                              prose-ol:my-1.5 prose-ol:pl-4
                              prose-code:text-accent prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                              prose-headings:text-white prose-headings:font-bold prose-headings:my-2
                              prose-h3:text-sm prose-h4:text-sm
                            ">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                       </div>
                    </div>
                  )
               })}

               {/* Message Limit Reached Message */}
               {isLimitReached && process.env.NODE_ENV !== 'development' && (
                  <div className="flex justify-center">
                     <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 border border-accent/30 rounded-2xl p-6 text-center max-w-[90%] shadow-xl backdrop-blur-sm">
                        <div className="text-accent font-bold mb-3 text-lg">💫 Chat Session Complete</div>
                        <div className="text-muted text-sm leading-relaxed space-y-2">
                           <p>You've reached the {MESSAGE_LIMIT}-message limit for this session.</p>
                           <p>Thank you for exploring Catalyst AI!</p>
                           <p className="text-accent/80 text-xs font-medium bg-accent/10 rounded-lg px-3 py-2 inline-block mt-3">
                             Close and reopen the chat to start a new session
                           </p>
                        </div>
                     </div>
                  </div>
               )}
               
               {/* Conversation Starters (Only show if only 1 message exists) */}
               {messages.length === 1 && (
                  <div className="mt-6 px-2">
                     <div className="bg-gradient-to-r from-card/30 via-card/20 to-card/30 backdrop-blur-sm rounded-2xl p-4 border border-card-border/40">
                        <p className="text-sm text-foreground/90 font-medium mb-3 text-center flex items-center justify-center gap-2">
                           <Sparkles className="w-4 h-4 text-accent" />
                           Suggested Commands
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                           {STARTERS.map((starter, idx) => (
                              <button
                                 key={idx}
                                 onClick={() => handleSendMessage(starter)}
                                 className="text-left text-sm p-3 rounded-xl border border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-foreground/80 hover:text-accent transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                 {starter}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {isLoading && !messages[messages.length-1].content && (
                   <div className="flex justify-start">
                       <div className="bg-gradient-to-br from-card via-card/80 to-card/60 border border-card-border/60 p-4 rounded-2xl rounded-tl-md shadow-lg">
                           <div className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin text-accent" />
                              <span className="text-sm text-muted font-medium">Catalyst is thinking...</span>
                       </div>
                       </div>
                   </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 border-t border-card-border/40 bg-gradient-to-r from-card/20 via-card/10 to-card/20 backdrop-blur-sm">
               <form onSubmit={handleSubmit} className="space-y-3">
               <div className="relative">
               <input
                     type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                     placeholder={isLimitReached ? "Chat session limit reached" : "Type a command..."}
                     disabled={isLimitReached}
                     className="w-full bg-background/80 backdrop-blur-sm border border-card-border/60 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all duration-200 shadow-sm"
               />
               <button 
                 type="submit" 
                     disabled={isLoading || !input.trim() || isLimitReached}
                     className="absolute right-2 top-2 p-2 bg-accent/20 hover:bg-accent/40 disabled:bg-card-border/40 text-accent disabled:text-muted rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
               >
                 <Send className="w-4 h-4" />
               </button>
               </div>
               {isLimitReached && process.env.NODE_ENV !== 'development' && (
                     <div className="text-center text-xs text-muted/80 bg-accent/10 rounded-lg px-3 py-2">
                        Messages used: {messageCount}/{MESSAGE_LIMIT}
                     </div>
                  )}
               {!isLimitReached && process.env.NODE_ENV !== 'development' && messageCount > 0 && (
                     <div className="text-center text-xs text-muted/60">
                        Messages: {messageCount}/{MESSAGE_LIMIT}
                     </div>
                  )}
            </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
