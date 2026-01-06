import React, { useMemo, useState, useEffect } from "react"

/* ================= TYPES ================= */

interface RawCourse {
  id: string
  title: string
  provider?: string
  level?: string
  duration_hours?: number
  url?: string
  category?: string
  tags?: string[]
}

interface CourseUI {
  id: string
  title: string
  subtitle: string
  description: string
  url?: string
  category?: string
}

/* ================= HELPERS ================= */

function normalizeCourse(raw: RawCourse): CourseUI {
  return {
    id: raw.id,
    title: raw.title,
    subtitle: `${raw.provider ?? "Unknown"} • ${raw.level ?? "All Levels"}`,
    description: `Category: ${raw.category ?? "General"} · ${
      raw.duration_hours ?? "N/A"
    } hrs`,
    url: raw.url,
    category: raw.category,
  }
}

/* ================= COMPONENT ================= */

export default function Courses(): React.JSX.Element {
  const [courses, setCourses] = useState<CourseUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    let alive = true

    async function loadCourses() {
      try {
        const res = await fetch(
          "/api/v1/learning/resources/courses",
          { credentials: "include" }
        )

        if (!res.ok) throw new Error("Request failed")

        const json = await res.json()
        const items: RawCourse[] = Array.isArray(json.items)
          ? json.items
          : []

        const normalized = items.map(normalizeCourse)

        if (alive) setCourses(normalized)
      } catch (err) {
        console.error("Courses fetch error:", err)
        if (alive) setError("Failed to load courses")
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadCourses()
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q)
    )
  }, [courses, query])

  if (loading) return <div className="p-4">Loading courses…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="p-4 space-y-4">
      <header className="flex justify-between">
        <h2 className="text-2xl font-semibold">Courses</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses"
          className="border px-3 py-2 rounded-md"
        />
      </header>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <article
            key={c.id}
            className="border rounded-xl p-4 hover:shadow cursor-pointer"
            onClick={() => c.url && window.open(c.url, "_blank")}
          >
            <h3 className="font-semibold text-sm">{c.title}</h3>
            <p className="text-xs text-slate-500">{c.subtitle}</p>
            <p className="text-xs text-slate-600 mt-2">{c.description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
