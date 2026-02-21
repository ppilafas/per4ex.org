"use client"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CodeBlockProps {
  language?: string
  children: string
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-white/10">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/10">
        <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/40 hover:text-white/80 transition-colors rounded hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content */}
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "#0d0d0d",
          fontSize: "0.875rem",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            fontFamily: "var(--font-mono), ui-monospace, monospace",
          }
        }}
        showLineNumbers={children.split("\n").length > 3}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: "rgba(255,255,255,0.2)",
          userSelect: "none",
        }}
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  )
}

// Inline code component
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 text-sm font-mono text-lime-400 bg-white/10 rounded border border-white/10">
      {children}
    </code>
  )
}
