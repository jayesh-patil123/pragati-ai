import * as React from "react"

type ScrapeStatus = "idle" | "configured" | "running" | "completed" | "failed" | "stopped"

type ScrapeType = "html" | "text" | "links" | "metadata"

export default function ScraperPanel() {
  const [status, setStatus] = React.useState<ScrapeStatus>("idle")
  const [targetUrl, setTargetUrl] = React.useState("")
  const [scrapeType, setScrapeType] = React.useState<ScrapeType>("text")
  const [depth, setDepth] = React.useState(1)
  const [logs, setLogs] = React.useState<string[]>([])
  const [pagesScraped, setPagesScraped] = React.useState(0)
  const intervalRef = React.useRef<number | null>(null)

  const SCRAPE_STEPS = React.useMemo(
    () => [
      "Validating target URL...",
      "Resolving DNS...",
      "Establishing secure connection...",
      "Downloading page content...",
      "Parsing document structure...",
      "Extracting target data...",
      "Queuing next depth crawl...",
      "Normalizing results...",
      "Finalizing scrape output...",
    ],
    []
  )

  const isConfigured = targetUrl.trim().length > 0

  const startScrape = () => {
    if (!isConfigured || status === "running") return

    setStatus("running")
    setLogs([])
    setPagesScraped(0)

    let stepIndex = 0
    let pageCounter = 1

    intervalRef.current = window.setInterval(() => {
      setLogs((prev) => [...prev, SCRAPE_STEPS[stepIndex]])
      setPagesScraped(pageCounter)
      stepIndex++
      pageCounter++

      if (stepIndex >= SCRAPE_STEPS.length) {
        finalizeScrape()
      }
    }, 850)
  }

  const finalizeScrape = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus("completed")
  }

  const stopScrape = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus("stopped")
  }

  const resetScrape = () => {
    stopScrape()
    setStatus("idle")
    setTargetUrl("")
    setScrapeType("text")
    setDepth(1)
    setLogs([])
    setPagesScraped(0)
  }

  React.useEffect(() => {
    if (isConfigured && status === "idle") {
      setStatus("configured")
    }
  }, [isConfigured, status])

  return (
    <section className="w-full rounded-xl border bg-white p-5 space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Scraper Configuration Panel
        </h3>

        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            status === "running"
              ? "bg-blue-50 text-blue-700 border-blue-300"
              : status === "completed"
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : status === "failed"
              ? "bg-red-50 text-red-700 border-red-300"
              : status === "stopped"
              ? "bg-yellow-50 text-yellow-700 border-yellow-300"
              : status === "configured"
              ? "bg-purple-50 text-purple-700 border-purple-300"
              : "bg-gray-50 text-gray-700 border-gray-300"
          }`}
        >
          {status.toUpperCase()}
        </span>
      </header>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target URL */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Target URL
          </label>
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Scrape Type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Data Type
          </label>
          <select
            value={scrapeType}
            onChange={(e) => setScrapeType(e.target.value as ScrapeType)}
            className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="text">Text Content</option>
            <option value="html">Raw HTML</option>
            <option value="links">Links Only</option>
            <option value="metadata">Metadata</option>
          </select>
        </div>

        {/* Crawl Depth */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Crawl Depth
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Pages Counter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Pages Scraped
          </label>
          <div className="rounded-lg border bg-gray-50 px-3 py-2 text-xs">
            {pagesScraped}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={startScrape}
          disabled={!isConfigured || status === "running"}
          className="rounded-full bg-black text-black px-4 py-2 text-xs disabled:opacity-40"
        >
          Create New Scrape
        </button>

        <button
          onClick={stopScrape}
          disabled={status !== "running"}
          className="rounded-full border px-4 py-2 text-xs disabled:opacity-40"
        >
          Stop
        </button>

        <button
          onClick={resetScrape}
          disabled={status === "running"}
          className="rounded-full border px-4 py-2 text-xs disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      {/* Live Scrape Logs */}
      <div className="h-52 overflow-y-auto rounded-lg border bg-black p-3 text-[11px] text-cyan-400 font-mono space-y-1">
        {logs.length === 0 ? (
          <p className="text-gray-500">
            Awaiting scrape configuration...
          </p>
        ) : (
          logs.map((log, idx) => <p key={idx}>{log}</p>)
        )}
      </div>

      {/* Completion Banner */}
      {status === "completed" && (
        <div className="rounded-lg border bg-emerald-50 p-3 text-xs text-emerald-700">
          ✅ Scraping completed successfully. Data is ready for downstream
          processing.
        </div>
      )}

      {status === "stopped" && (
        <div className="rounded-lg border bg-yellow-50 p-3 text-xs text-yellow-700">
          ⚠️ Scraping process was manually stopped.
        </div>
      )}
    </section>
  )
}
