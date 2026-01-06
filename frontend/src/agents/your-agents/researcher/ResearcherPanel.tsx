import * as React from "react"

type ResearchStatus = "idle" | "collecting" | "analyzing" | "completed" | "stopped"

interface ResearchFinding {
  title: string
  summary: string
}

export default function ResearcherPanel() {
  const [status, setStatus] = React.useState<ResearchStatus>("idle")
  const [logs, setLogs] = React.useState<string[]>([])
  const [findings, setFindings] = React.useState<ResearchFinding[]>([])
  const intervalRef = React.useRef<number | null>(null)

  const RESEARCH_STEPS = React.useMemo(
    () => [
      "Initializing research environment...",
      "Querying academic databases...",
      "Scraping verified public sources...",
      "Filtering low-confidence data...",
      "Clustering related information...",
      "Running semantic relevance scoring...",
      "Generating structured research findings...",
    ],
    []
  )

  const MOCK_FINDINGS = React.useMemo<ResearchFinding[]>(
    () => [
      {
        title: "Market Trend Identification",
        summary:
          "Data indicates a 28% year-over-year increase in user adoption across AI-assisted enterprise tooling.",
      },
      {
        title: "Competitive Landscape",
        summary:
          "Top competitors are focusing on workflow automation and reasoning engines as primary differentiators.",
      },
      {
        title: "Risk & Compliance Signals",
        summary:
          "Regulatory frameworks are tightening around AI-generated decision systems and audit traceability.",
      },
    ],
    []
  )

  const startResearch = () => {
    if (status !== "idle") return

    setStatus("collecting")
    setLogs([])
    setFindings([])

    let stepIndex = 0

    intervalRef.current = window.setInterval(() => {
      setLogs((prev) => [...prev, RESEARCH_STEPS[stepIndex]])
      stepIndex++

      if (stepIndex === 3) {
        setStatus("analyzing")
      }

      if (stepIndex >= RESEARCH_STEPS.length) {
        finalizeResearch()
      }
    }, 900)
  }

  const finalizeResearch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setFindings(MOCK_FINDINGS)
    setStatus("completed")
  }

  const stopResearch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setStatus("stopped")
  }

  const resetResearch = () => {
    stopResearch()
    setStatus("idle")
    setLogs([])
    setFindings([])
  }

  return (
    <section className="w-full rounded-xl border bg-white p-5 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Researcher Agent Workspace
        </h3>

        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            status === "collecting"
              ? "bg-blue-50 text-blue-700 border-blue-300"
              : status === "analyzing"
              ? "bg-purple-50 text-purple-700 border-purple-300"
              : status === "completed"
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : status === "stopped"
              ? "bg-red-50 text-red-700 border-red-300"
              : "bg-gray-50 text-gray-700 border-gray-300"
          }`}
        >
          {status.toUpperCase()}
        </span>
      </header>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={startResearch}
          disabled={status !== "idle"}
          className="rounded-full bg-black text-black px-4 py-2 text-xs disabled:opacity-40"
        >
          New Research Session
        </button>

        <button
          onClick={stopResearch}
          disabled={status !== "collecting" && status !== "analyzing"}
          className="rounded-full border px-4 py-2 text-xs disabled:opacity-40"
        >
          Stop
        </button>

        <button
          onClick={resetResearch}
          disabled={status === "collecting" || status === "analyzing"}
          className="rounded-full border px-4 py-2 text-xs disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      {/* Live Research Feed */}
      <div className="h-48 overflow-y-auto rounded-lg border bg-black p-3 text-[11px] text-blue-400 font-mono space-y-1">
        {logs.length === 0 ? (
          <p className="text-gray-500">
            Awaiting research session...
          </p>
        ) : (
          logs.map((log, idx) => <p key={idx}>{log}</p>)
        )}
      </div>

      {/* Findings Output */}
      {status === "completed" && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            Research Findings
          </h4>

          <div className="grid gap-3">
            {findings.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border bg-gray-50 p-3 space-y-1"
              >
                <p className="text-xs font-medium text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-600">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "stopped" && (
        <div className="rounded-lg border bg-red-50 p-3 text-xs text-red-700">
          ⚠️ Research session was manually stopped.
        </div>
      )}
    </section>
  )
}
