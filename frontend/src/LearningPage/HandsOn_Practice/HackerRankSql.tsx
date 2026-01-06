// frontend/src/LearningPage/HandsOn_Practice/HackerRankSql.tsx

import React, { useEffect, useState } from "react"

/* ------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------ */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000"

/* ------------------------------------------------------------------
 * Inline SVG Icons
 * ------------------------------------------------------------------ */

const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const CopyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" />
  </svg>
)

const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20h14v-2H5v2zM12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L12 13.17V3z" />
  </svg>
)

const DatabaseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C7.031 2 3 3.79 3 6v12c0 2.21 4.031 4 9 4s9-1.79 9-4V6c0-2.21-4.031-4-9-4z" />
  </svg>
)

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type SqlSample = {
  id: string
  title: string
  query: string
}

type SqlResultRow = Record<string, string | number>

/* ------------------------------------------------------------------
 * Local fallback challenges
 * ------------------------------------------------------------------ */

const FALLBACK_SQL: SqlSample[] = [
  {
    id: "employees",
    title: "Select All Employees",
    query: "SELECT * FROM employees;",
  },
  {
    id: "count",
    title: "Count Employees",
    query: "SELECT COUNT(*) AS total FROM employees;",
  },
  {
    id: "filter",
    title: "Filter by Department",
    query: "SELECT * FROM employees WHERE department = 'Engineering';",
  },
]

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

export default function HackerRankSql(): React.JSX.Element {
  const [samples, setSamples] = useState<SqlSample[]>([])
  const [query, setQuery] = useState("")
  const [resultRows, setResultRows] = useState<SqlResultRow[] | null>(null)

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("Initializing SQL playground…")
  const [backendAvailable, setBackendAvailable] = useState(false)

  /* ------------------------------------------------------------------
   * Load SQL challenges
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/v1/learning/sql/challenges`)
        if (!res.ok) throw new Error()

        const data = (await res.json()) as SqlSample[]
        if (mounted && Array.isArray(data) && data.length) {
          setSamples(data)
          setQuery(data[0].query)
          setBackendAvailable(true)
          setStatus("Connected to backend")
          return
        }
      } catch {
        if (mounted) {
          setSamples(FALLBACK_SQL)
          setQuery(FALLBACK_SQL[0].query)
          setBackendAvailable(false)
          setStatus("Demo mode — backend not connected")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  /* ------------------------------------------------------------------
   * Actions
   * ------------------------------------------------------------------ */

  function loadSample(sample: SqlSample) {
    setQuery(sample.query)
    setResultRows(null)
    setStatus(`Loaded: ${sample.title}`)
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setStatus("Copied to clipboard")
    } catch {
      setStatus("Copy failed")
    }
  }

  function downloadQuery(text: string) {
    const blob = new Blob([text], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "query.sql"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function runQuery() {
    if (!backendAvailable) {
      setStatus("Demo mode — SQL execution disabled")
      setResultRows([])
      return
    }

    setStatus("Running query…")
    setResultRows(null)

    try {
      const res = await fetch(`${API_BASE}/v1/learning/sql/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) throw new Error()

      const data = (await res.json()) as SqlResultRow[]
      setResultRows(Array.isArray(data) ? data : [])
      setStatus("Query executed successfully")
    } catch {
      setStatus("Execution failed")
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Loading SQL exercises…
      </div>
    )
  }

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold">
            SQL Exercises – HackerRank Style
          </h3>
          <div className="text-xs text-slate-500">{status}</div>
        </div>
        <div className="text-xs text-slate-400">
          {backendAvailable ? "Backend Connected" : "Demo Mode"}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <aside className="space-y-2">
          {samples.map((s) => (
            <div key={s.id} className="border rounded p-2">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="mt-2 flex gap-2">
                <button
                  className="inline-flex items-center gap-1 text-xs border px-2 py-1 rounded"
                  onClick={() => loadSample(s)}
                >
                  <DatabaseIcon /> Use
                </button>
                <button
                  className="inline-flex items-center gap-1 text-xs border px-2 py-1 rounded"
                  onClick={() => copyToClipboard(s.query)}
                >
                  <CopyIcon /> Copy
                </button>
              </div>
            </div>
          ))}
        </aside>

        <section className="col-span-2">
          <textarea
            className="w-full h-40 border rounded p-2 font-mono text-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={runQuery}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded"
            >
              <PlayIcon /> Run
            </button>
            <button
              onClick={() => copyToClipboard(query)}
              className="inline-flex items-center gap-2 px-3 py-1.5 border rounded text-sm"
            >
              <CopyIcon /> Copy
            </button>
            <button
              onClick={() => downloadQuery(query)}
              className="inline-flex items-center gap-2 px-3 py-1.5 border rounded text-sm"
            >
              <DownloadIcon /> Download
            </button>
          </div>

          <div className="mt-3 border rounded p-2 min-h-16 text-xs">
            {resultRows === null
              ? "Run a query to see results."
              : resultRows.length === 0
              ? "No results (demo mode)."
              : JSON.stringify(resultRows, null, 2)}
          </div>
        </section>
      </div>
    </div>
  )
}
