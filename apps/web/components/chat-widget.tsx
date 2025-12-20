"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Cpu, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "System online. Catalyst Agent ready. How can I assist you with this portfolio?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setIsLoading(true)

    // Add placeholder for assistant response
    setMessages(prev => [...prev, { role: "assistant", content: "" }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            messages: [{ role: "user", content: userMsg }],
            session_id: sessionId
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
                    if (!dataStr.trim()) continue; // Skip empty data lines

                    const data = JSON.parse(dataStr)
                    // console.log("Stream Data:", data); // Debugging

                    // 1. Metadata / Session Init / Store Info (Ignore display)
                    if (data.session_id && !sessionId) {
                        setSessionId(data.session_id)
                        continue
                    }
                    if (data.store_type || data.hits) {
                        // This is a RAG metadata chunk, do not display raw JSON
                        continue 
                    }

                    // 2. RAG Answer (Full Block)
                    if (data.grounded_answer) {
                        assistantMessage = data.grounded_answer
                    }
                    // 3. Streaming Text (Token)
                    else if (data.content || data.text) {
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
                    // Ignore parse errors (might be [DONE] or empty lines)
                }
            }
        }
      }

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

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-accent text-black rounded-full shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all duration-300 z-50 border border-black/20"
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
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] bg-background/95 backdrop-blur-xl border border-card-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-card-border bg-card/50 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                  <Cpu className="w-4 h-4 text-accent" />
               </div>
               <div>
                  <h3 className="font-bold text-foreground text-sm">Catalyst Core</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     System Online
                  </p>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                     <div className={cn(
                        "max-w-[80%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user" 
                           ? "bg-accent text-black rounded-tr-none" 
                           : "bg-card border border-card-border text-foreground rounded-tl-none"
                     )}>
                        {msg.content}
                     </div>
                  </div>
               ))}
               {isLoading && !messages[messages.length-1].content && (
                   <div className="flex justify-start">
                       <div className="bg-card border border-card-border p-3 rounded-lg rounded-tl-none">
                           <Loader2 className="w-4 h-4 animate-spin text-muted" />
                       </div>
                   </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-card-border bg-card/30">
               <div className="relative">
                  <input 
                     type="text" 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder="Type a command..."
                     className="w-full bg-background border border-card-border rounded-full py-2.5 pl-4 pr-10 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  <button 
                     type="submit"
                     disabled={isLoading || !input.trim()}
                     className="absolute right-1.5 top-1.5 p-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-black rounded-full transition-colors disabled:opacity-50"
                  >
                     <Send className="w-4 h-4" />
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
