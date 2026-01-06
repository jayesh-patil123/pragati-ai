import React, { useEffect, useState } from "react"
import { Code, Brain, Route } from "lucide-react"

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";


/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type PathKey =
  | "pythonDev"
  | "ml"
  | "webDev"
  | "automation"
  | "dataScience"

type LearningPath = {
  id: PathKey
  title: string
  meta: string
  status: "Start" | "Continue"
  icon: "code" | "brain" | "route"
  description: string
  roadmap: string[]
}

/* ------------------------------------------------------------------
 * Icon map (backend sends icon as string)
 * ------------------------------------------------------------------ */

const ICON_MAP: Record<
  LearningPath["icon"],
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  code: Code,
  brain: Brain,
  route: Route,
}

/* ------------------------------------------------------------------
 * Fallback paths (used if backend unavailable)
 * ------------------------------------------------------------------ */

const FALLBACK_PATHS: LearningPath[] = [
  {
    id: "pythonDev",
    title: "Python Developer Path",
    meta: "5 skills · 10 hours",
    status: "Continue",
    icon: "code",
    description:
      "Build strong foundations in Python for scripting and backend work.",
    roadmap: [
      "Python basics: variables, data types, I/O",
      "Control flow: conditions & loops",
      "Functions, modules & virtual environments",
      "Working with files & errors",
      "Mini project: CLI tool or script",
    ],
  },
  {
    id: "ml",
    title: "Machine Learning Path",
    meta: "6 skills · 15 hours",
    status: "Start",
    icon: "brain",
    description:
      "Go from ML fundamentals to training real-world models.",
    roadmap: [
      "Intro to ML & problem types",
      "Regression & classification",
      "Model evaluation metrics",
      "Overfitting & regularization",
      "Hands-on ML project",
    ],
  },
  {
    id: "webDev",
    title: "Web Developer Path",
    meta: "8 skills · 20 hours",
    status: "Start",
    icon: "route",
    description:
      "Learn to build modern, production-ready web applications.",
    roadmap: [
      "HTML & CSS fundamentals",
      "JavaScript & DOM",
      "React & components",
      "APIs & data fetching",
      "Simple full-stack project",
    ],
  },
  {
    id: "automation",
    title: "Automation Engineer Path",
    meta: "4 skills · 12 hours",
    status: "Start",
    icon: "route",
    description:
      "Automate workflows using scripts and tools.",
    roadmap: [
      "Python scripting basics",
      "File & OS automation",
      "Web automation basics",
      "Scheduling & logging",
      "Automation project",
    ],
  },
  {
    id: "dataScience",
    title: "Data Scientist Path",
    meta: "7 skills · 18 hours",
    status: "Start",
    icon: "brain",
    description:
      "Analyze data, build models, and communicate insights.",
    roadmap: [
      "NumPy & pandas",
      "Exploratory Data Analysis",
      "Visualization",
      "Basic ML models",
      "End-to-end DS project",
    ],
  },
]

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

export default function Paths(): React.JSX.Element {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [selectedPath, setSelectedPath] = useState<PathKey | null>(null)

  const [customGoal, setCustomGoal] = useState("")
  const [customPlan, setCustomPlan] = useState<string | null>(null)

  const [loadingPaths, setLoadingPaths] = useState(true)
  const [generating, setGenerating] = useState(false)

  /* ------------------------------------------------------------------
   * Load paths from backend
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true

    async function loadPaths() {
      try {
        const res = await fetch(`${API_BASE}/v1/learning/paths`)


        if (!res.ok) throw new Error("Failed to fetch paths")

        const data = (await res.json()) as LearningPath[]

        if (mounted && Array.isArray(data)) {
          setPaths(data)
          return
        }

        throw new Error("Invalid response")
      } catch {
        if (mounted) setPaths(FALLBACK_PATHS)
      } finally {
        if (mounted) setLoadingPaths(false)
      }
    }

    loadPaths()

    return () => {
      mounted = false
    }
  }, [])

  /* ------------------------------------------------------------------
   * Custom AI Path generation
   * ------------------------------------------------------------------ */

  async function handleGenerateCustomPlan() {
    if (!customGoal.trim()) {
      setCustomPlan("Please describe your goal first.")
      return
    }

    setGenerating(true)
    setCustomPlan(null)

    try {
      const res = await fetch("/api/v1/learning/custom-path", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: customGoal }),
      })

      if (!res.ok) throw new Error("Request failed")

      const data: { plan?: string } = await res.json()

      setCustomPlan(data.plan ?? "No plan returned from server.")
    } catch {
      setCustomPlan("Server error. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  /* ------------------------------------------------------------------
   * Selected path
   * ------------------------------------------------------------------ */

  const activePath = paths.find((p) => p.id === selectedPath)

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  if (loadingPaths) {
    return (
      <div className="p-4 text-sm text-slate-600">
        Loading learning paths…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900">
        Recommended Learning Paths
      </h2>

      {/* Paths Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paths.map((path) => {
          const Icon = ICON_MAP[path.icon]
          const isSelected = selectedPath === path.id

          return (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              aria-pressed={isSelected}
              className={`text-left border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition
                flex flex-col justify-between gap-3 min-h-[120px]
                ${isSelected ? "border-slate-900" : "border-slate-200"}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {path.title}
                  </h3>
                  <p className="text-xs text-slate-500">{path.meta}</p>
                </div>
              </div>

              <span
                className={`inline-flex justify-center rounded-full px-3 py-1.5 text-[11px] font-medium
                  ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }
                `}
              >
                {path.status}
              </span>
            </button>
          )
        })}
      </div>

      {/* Path Details */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
        {activePath ? (
          <>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              {activePath.title} – Roadmap
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              {activePath.description}
            </p>
            <ol className="list-decimal pl-4 text-sm text-slate-700 space-y-1">
              {activePath.roadmap.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Select a path above to see its roadmap.
          </p>
        )}
      </div>

      {/* Custom AI Path */}
      <div className="border-t pt-4 border-dashed border-slate-300 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Create Custom Path with AI
        </h3>

        <textarea
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          rows={3}
          className="w-full text-sm rounded-xl border px-3 py-2"
          placeholder='e.g. "Get a Python backend internship in 3 months"'
        />

        <button
          onClick={handleGenerateCustomPlan}
          disabled={generating}
          className="px-4 py-2 text-sm rounded-full border hover:bg-slate-50 disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate Plan"}
        </button>

        {customPlan && (
          <pre className="bg-white border rounded-xl p-3 text-sm whitespace-pre-wrap">
            {customPlan}
          </pre>
        )}
      </div>
    </div>
  )
}
