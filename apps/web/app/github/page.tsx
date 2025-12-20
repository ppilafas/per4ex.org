"use client"

import Image from "next/image"
import useSWR from "swr"
import { Star } from "lucide-react"
import { getApiUrl } from "@/lib/config"
import { TypewriterSubtitle } from "@/components/typewriter"

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function GitHubProjects() {
  const API_URL = getApiUrl()
  const { data, error, isLoading } = useSWR(`${API_URL}/api/github/repos`, fetcher)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
             <Image src="/github.png" alt="GitHub" fill className="object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">
            GitHub
          </h1>
          <TypewriterSubtitle 
             text="Open source contributions and public repositories" 
             className="mb-6 text-lg md:text-xl"
          />
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      <div>
        {!data && !error && (
            <div className="text-center py-10">Loading repositories...</div>
        )}

        {error && (
             <div className="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-200">
                Unable to load GitHub repositories. Is the API running?
             </div>
        )}

        {data && data.repos && (
           <div className="space-y-6">
              <p className="text-muted mb-4">
                 Showing public repositories from <a href={`https://github.com/${data.user}`} target="_blank" className="underline hover:text-foreground">github.com/{data.user}</a>.
              </p>
              
              {data.repos.map((repo: any) => (
                  <div key={repo.name} className="glass-panel hover:bg-card/80 transition-colors">
                      <h4 className="text-xl font-bold text-foreground mb-2">
                         <a href={repo.html_url} target="_blank" className="hover:underline">{repo.name}</a>
                      </h4>
                      <div className="text-sm text-muted mb-3 flex items-center gap-3">
                         <span className="bg-card-border px-2 py-0.5 rounded text-foreground">{repo.language || "Unknown"}</span>
                         <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" /> {repo.stargazers_count}
                         </span>
                      </div>
                      <p className="text-muted leading-relaxed mb-3">
                         {repo.description || "No description provided."}
                      </p>
                      <p className="text-xs text-gray-500">
                         Last updated: {new Date(repo.updated_at).toLocaleDateString()}
                      </p>
                  </div>
              ))}
           </div>
        )}
      </div>
    </div>
  )
}
