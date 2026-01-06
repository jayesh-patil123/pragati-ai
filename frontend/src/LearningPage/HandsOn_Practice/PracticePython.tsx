// frontend/src/LearningPage/HandsOn_Practice/PracticePython.tsx

import React, { useMemo, useState } from "react"

/* ------------------------------------------------------------------
 * Inline SVG Icons (no external dependencies)
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

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type PythonSnippet = {
  id: string
  title: string
  description: string
  code: string
}

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

export default function PracticePython(): React.JSX.Element {
  /* --------------------------------------------------------------
   * Static snippets (safe, offline-first)
   * -------------------------------------------------------------- */

  const snippets = useMemo<PythonSnippet[]>(
    () => [
      {
        id: "prime",
        title: "Check if a number is prime",
        description: "Efficient trial division up to √n.",
        code: `def is_prime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0:
        return False

    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True

print(is_prime(97))  # True
`,
      },
      {
        id: "csv_avg",
        title: "Compute column averages from CSV",
        description: "Robust CSV parsing using DictReader.",
        code: `import csv
from collections import defaultdict

def column_averages(path):
    sums = defaultdict(float)
    counts = defaultdict(int)

    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            for k, v in row.items():
                try:
                    val = float(v)
                except (ValueError, TypeError):
                    continue
                sums[k] += val
                counts[k] += 1

    return {k: sums[k] / counts[k] for k in counts}
`,
      },
      {
        id: "list_comp",
        title: "List comprehensions",
        description: "Concise transformation & filtering.",
        code: `squares = [x * x for x in range(10) if x % 2 == 0]
print(squares)
`,
      },
    ],
    []
  )

  /* ------------------------------------------------------------------
   * State
   * ------------------------------------------------------------------ */

  const [selected, setSelected] = useState<PythonSnippet>(snippets[0])
  const [status, setStatus] = useState<string | null>(null)

  /**
   * IMPORTANT:
   * Backend execution is intentionally disabled
   * until a secure execution service is wired.
   */
  const backendAvailable = false

  /* ------------------------------------------------------------------
   * Actions
   * ------------------------------------------------------------------ */

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(selected.code)
      setStatus("Code copied to clipboard.")
    } catch {
      setStatus("Failed to copy code.")
    } finally {
      setTimeout(() => setStatus(null), 2000)
    }
  }

  function downloadCode() {
    const blob = new Blob([selected.code], { type: "text/x-python" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selected.id}.py`
    a.click()
    URL.revokeObjectURL(url)
  }

  function runPython() {
    if (!backendAvailable) {
      setStatus(
        "Demo mode — Python execution requires a secure backend or Pyodide."
      )
      setTimeout(() => setStatus(null), 3000)
      return
    }

    // FUTURE:
    // POST /api/v1/learning/python/execute
  }

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          Practice Python – Hands-On
        </h3>
        <span className="text-xs text-slate-500">
          {backendAvailable ? "Backend Connected" : "Demo Mode"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Sidebar */}
        <aside className="col-span-1">
          <ul className="space-y-2">
            {snippets.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s)}
                  className={`w-full text-left p-2 rounded ${
                    selected.id === s.id
                      ? "bg-slate-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-slate-500">
                    {s.description}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main panel */}
        <section className="col-span-2">
          <p className="text-sm text-slate-700 mb-2">
            {selected.description}
          </p>

          <div className="flex gap-2 mb-3">
            <button
              onClick={runPython}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-600 text-white text-sm"
            >
              <PlayIcon /> Run (Backend)
            </button>

            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm"
            >
              <CopyIcon /> Copy
            </button>

            <button
              onClick={downloadCode}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm"
            >
              <DownloadIcon /> Download
            </button>
          </div>

          <label className="text-xs text-slate-500">Python snippet</label>
          <textarea
            value={selected.code}
            readOnly
            className="w-full h-48 border rounded p-2 font-mono text-xs mt-1"
          />

          <div className="mt-3">
            <label className="text-xs text-slate-500">Notes</label>
            <p className="text-xs text-slate-500 mt-1">
              Python execution must run in a sandbox (Docker / Firecracker /
              Pyodide). This UI is intentionally offline-safe.
            </p>
            {status && (
              <div className="mt-2 text-sm text-emerald-600">
                {status}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
