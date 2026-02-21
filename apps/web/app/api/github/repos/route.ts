import { NextRequest, NextResponse } from "next/server"

const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$/

// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL_MS = 3600_000 // 1 hour

function getCached(key: string): unknown | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: unknown) {
  // Evict oldest if cache gets too large
  if (cache.size >= 100) {
    const oldest = cache.keys().next().value
    if (oldest) cache.delete(oldest)
  }
  cache.set(key, { data, ts: Date.now() })
}

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user") || "ppilafas"

  // Validate username
  if (!user || user.length > 39 || !GITHUB_USERNAME_PATTERN.test(user)) {
    return NextResponse.json(
      { error: "Invalid GitHub username format" },
      { status: 400 }
    )
  }

  // Check cache
  const cached = getCached(user)
  if (cached) {
    return NextResponse.json(cached)
  }

  // Fetch from GitHub API
  try {
    const response = await fetch(
      `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "supercore-tech",
        },
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `User '${user}' not found on GitHub` },
          { status: 404 }
        )
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}` },
        { status: 503 }
      )
    }

    const reposData = await response.json()

    const repos = reposData
      .map((r: Record<string, unknown>) => ({
        name: r.name || "",
        description: r.description || null,
        html_url: r.html_url || "",
        language: r.language || null,
        stargazers_count: (r.stargazers_count as number) || 0,
        updated_at: (r.updated_at as string) || "",
      }))
      .sort(
        (a: { updated_at: string }, b: { updated_at: string }) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )

    const result = { user, repos }
    setCache(user, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("GitHub API fetch error:", error)
    return NextResponse.json(
      { error: "Failed to connect to GitHub API" },
      { status: 503 }
    )
  }
}
