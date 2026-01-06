import React, { useEffect, useMemo, useRef, useState } from "react"

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type Repo = {
  name: string
  url: string
  stars?: string
  description?: string
  category?: string
}

/* ------------------------------------------------------------------
 * API (proxy-safe)
 * ------------------------------------------------------------------ */

const REPOS_API = "/api/v1/learning/github-projects/repos"

/* ------------------------------------------------------------------
 * Embedded fallback (offline-first)
 * ------------------------------------------------------------------ */

const FALLBACK_REPOS: Repo[] = [
  {
    name: "freeCodeCamp/freeCodeCamp",
    url: "https://github.com/freeCodeCamp/freeCodeCamp",
    stars: "400k+",
    description: "Learn to code for free — open source curriculum.",
    category: "Learning",
  },
  {
    name: "TheAlgorithms/Python",
    url: "https://github.com/TheAlgorithms/Python",
    stars: "180k+",
    description: "Algorithms and data structures implemented in Python.",
    category: "Algorithms",
  },
  {
    name: "karpathy/nanoGPT",
    url: "https://github.com/karpathy/nanoGPT",
    stars: "85k+",
    description: "Minimal GPT training and sampling in PyTorch.",
    category: "ML",
  },
]

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

export default function ExploreRepos(): React.JSX.Element {
  const [repos, setRepos] = useState<Repo[]>([])
  const [query, setQuery] = useState("")
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * Stable ref map for scroll + focus
   */
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({})

  /* ------------------------------------------------------------------
   * Load repos (Backend → Fallback)
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true

    async function loadRepos() {
      try {
        const res = await fetch(`${REPOS_API}?top=100`)
        if (res.ok) {
          const data = await res.json()

          // ✅ BACKEND RETURNS { repos: [...] }
          if (mounted && Array.isArray(data.repos)) {
            setRepos(data.repos)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn("GitHub repos API unavailable", err)
      }

      // ✅ fallback always works
      if (mounted) {
        setRepos(FALLBACK_REPOS)
        setLoading(false)
      }
    }

    loadRepos()

    return () => {
      mounted = false
    }
  }, [])

  /* ------------------------------------------------------------------
   * Search & ranking logic
   * ------------------------------------------------------------------ */

  const filteredRepos = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return repos

    const score = (r: Repo): number => {
      const name = r.name.toLowerCase()
      const [owner, repo] = name.split("/")
      const desc = (r.description ?? "").toLowerCase()
      const cat = (r.category ?? "").toLowerCase()

      if (name === q) return 0
      if (name.startsWith(q)) return 1
      if (repo?.startsWith(q) || owner?.startsWith(q)) return 1
      if (name.includes(q)) return 2
      if (desc.includes(q) || cat.includes(q)) return 4
      return 6
    }

    return repos
      .filter((r) => {
        const lc = r.name.toLowerCase()
        return (
          lc.includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.category ?? "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const sa = score(a)
        const sb = score(b)
        return sa !== sb ? sa - sb : a.name.localeCompare(b.name)
      })
  }, [repos, query])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    return filteredRepos.slice(0, 8).map((r) => ({
      name: r.name,
      url: r.url,
    }))
  }, [filteredRepos, query])

  /* ------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------ */

  function handleSuggestionSelect(name: string, url: string) {
    setQuery(name)
    setSelectedUrl(url)

    const el = itemRefs.current[url]
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.focus()
    }
  }

  /* ------------------------------------------------------------------
   * Loading UI
   * ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Loading repositories…
      </div>
    )
  }

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <section>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        Explore Top GitHub Repositories
      </h3>

      <p className="text-sm text-slate-700 mb-4">
        Curated open-source projects across AI, ML, full-stack, DevOps,
        system design, and learning resources.
      </p>

      {/* Search */}
      <div className="relative mb-4 w-full sm:w-1/2">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedUrl(null)
          }}
          placeholder="Search repositories (e.g. react, ml, docker)"
          className="w-full border rounded-md px-3 py-2 text-sm"
          aria-label="Search GitHub repositories"
        />

        {suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow max-h-60 overflow-auto">
            {suggestions.map((s) => (
              <li key={s.url}>
                <button
                  onClick={() => handleSuggestionSelect(s.name, s.url)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Repo Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRepos.map((r) => {
          const selected = selectedUrl === r.url

          return (
            <li
              key={r.url}
              ref={(el) => {
                itemRefs.current[r.url] = el
              }}
              tabIndex={0}
              className={`bg-white border rounded-lg p-3 outline-none transition ${
                selected
                  ? "ring-2 ring-sky-400 border-sky-400"
                  : "hover:shadow"
              }`}
            >
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-900 hover:underline"
                onClick={() => setSelectedUrl(r.url)}
              >
                {r.name}
              </a>

              <div className="text-xs text-slate-500 mt-1">
                ⭐ {r.stars ?? "—"}
              </div>

              {r.description && (
                <p className="text-sm text-slate-700 mt-2">
                  {r.description}
                </p>
              )}

              <div className="mt-2 text-xs">
                <span className="text-slate-500">Category:</span>{" "}
                <span className="font-medium text-slate-800">
                  {r.category ?? "General"}
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {filteredRepos.length === 0 && (
        <div className="mt-4 text-sm text-slate-600">
          No repositories match your search.
        </div>
      )}
    </section>
  )
}
