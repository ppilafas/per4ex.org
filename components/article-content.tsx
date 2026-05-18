"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock, InlineCode } from "./code-block"
import type { Components } from "react-markdown"
import { Check, Square } from "@phosphor-icons/react"
interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  const components: Components = {
    // Code blocks with syntax highlighting
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const isInline = !match && !className
      
      if (isInline) {
        return <InlineCode>{children}</InlineCode>
      }
      
      return (
        <CodeBlock language={match?.[1]}>
          {String(children).replace(/\n$/, "")}
        </CodeBlock>
      )
    },
    
    // Remove default pre wrapper
    pre({ children }) {
      return <>{children}</>
    },
    
    // Headings with anchor links
    h1({ children }) {
      return (
        <h1 className="text-3xl font-bold text-white mt-12 mb-6 first:mt-0">
          {children}
        </h1>
      )
    },
    h2({ children }) {
      return (
        <h2 className="text-2xl font-bold text-white mt-12 mb-4 pb-2 border-b border-white/10">
          {children}
        </h2>
      )
    },
    h3({ children }) {
      return (
        <h3 className="text-xl font-semibold text-white mt-8 mb-3">
          {children}
        </h3>
      )
    },
    h4({ children }) {
      return (
        <h4 className="text-lg font-semibold text-white mt-6 mb-2">
          {children}
        </h4>
      )
    },
    
    // Paragraphs
    p({ children }) {
      return (
        <p className="text-white/80 leading-relaxed mb-4">
          {children}
        </p>
      )
    },
    
    // Links
    a({ href, children }) {
      const isExternal = href?.startsWith("http")
      return (
        <a 
          href={href}
          className="text-accent hover:underline underline-offset-2"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
          {isExternal && <span className="text-xs ml-1">↗</span>}
        </a>
      )
    },
    
    // Lists
    ul({ children }) {
      return (
        <ul className="list-none space-y-2 mb-6 ml-0">
          {children}
        </ul>
      )
    },
    ol({ children }) {
      return (
        <ol className="list-decimal list-inside space-y-2 mb-6 ml-0 marker:text-accent marker:font-semibold">
          {children}
        </ol>
      )
    },
    li({ children, ...props }) {
      // Check for task list items (GFM)
      const content = String(children)
      const isChecked = content.startsWith("[x]") || content.startsWith("[X]")
      const isUnchecked = content.startsWith("[ ]")
      
      if (isChecked || isUnchecked) {
        return (
          <li className="flex items-start gap-2 text-white/80">
            {isChecked ? (
              <Check className="w-4 h-4 mt-1 text-accent flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 mt-1 text-white/40 flex-shrink-0" />
            )}
            <span>{String(children).slice(3).trim()}</span>
          </li>
        )
      }
      
      return (
        <li className="flex items-start gap-2 text-white/80">
          <span className="text-accent mt-1.5 flex-shrink-0">•</span>
          <span>{children}</span>
        </li>
      )
    },
    
    // Blockquotes
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-accent/50 pl-4 py-1 my-6 bg-white/[0.02] rounded-r-lg italic text-white/70">
          {children}
        </blockquote>
      )
    },
    
    // Horizontal rules
    hr() {
      return <hr className="border-white/10 my-8" />
    },
    
    // Bold and italic
    strong({ children }) {
      return <strong className="font-semibold text-white">{children}</strong>
    },
    em({ children }) {
      return <em className="italic text-white/90">{children}</em>
    },
    
    // Strikethrough (GFM)
    del({ children }) {
      return <del className="text-white/50 line-through">{children}</del>
    },
    
    // Tables (GFM)
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-white/10">
          <table className="w-full text-sm">{children}</table>
        </div>
      )
    },
    thead({ children }) {
      return <thead className="bg-white/5 border-b border-white/10">{children}</thead>
    },
    tbody({ children }) {
      return <tbody className="divide-y divide-white/5">{children}</tbody>
    },
    tr({ children }) {
      return <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>
    },
    th({ children }) {
      return (
        <th className="px-4 py-3 text-left font-semibold text-white text-xs uppercase tracking-wider">
          {children}
        </th>
      )
    },
    td({ children }) {
      return <td className="px-4 py-3 text-white/70">{children}</td>
    },
    
    // Images
    img({ src, alt }) {
      return (
        <figure className="my-8">
          <img 
            src={src} 
            alt={alt || ""} 
            className="rounded-xl border border-white/10 w-full"
          />
          {alt && (
            <figcaption className="text-center text-sm text-white/50 mt-3 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    },
  }

  return (
    <div className="article-content">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
