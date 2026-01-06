import { useEffect, useState } from "react"

interface CourseProgress {
  id: string
  title: string
  progress: number // 0–100
  lastAccessed: string
  completed: boolean
}

export default function LearningPage() {
  // ✅ Hooks unconditionally
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔗 READY FOR BACKEND
    // apiClient.get("/learning/progress").then(res => setCourses(res.data))

    // Mock data
    setTimeout(() => {
      setCourses([
        {
          id: "1",
          title: "Introduction to AI",
          progress: 100,
          lastAccessed: "2025-02-01",
          completed: true,
        },
        {
          id: "2",
          title: "Machine Learning Basics",
          progress: 65,
          lastAccessed: "2025-02-10",
          completed: false,
        },
        {
          id: "3",
          title: "Deep Learning with Python",
          progress: 30,
          lastAccessed: "2025-02-14",
          completed: false,
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading learning progress...
      </p>
    )
  }

  const completedCount = courses.filter((c) => c.completed).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Learning Progress
        </h2>
        <p className="text-sm text-slate-600">
          Track your courses and progress.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <p className="font-medium text-slate-900">
          Courses completed:{" "}
          <span className="font-semibold">
            {completedCount}/{courses.length}
          </span>
        </p>
      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <p className="text-sm text-slate-500">
          You haven’t started any courses yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {course.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    Last accessed: {course.lastAccessed}
                  </p>
                </div>

                {course.completed && (
                  <span className="text-xs font-medium text-green-600">
                    Completed
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${
                      course.completed
                        ? "bg-green-600"
                        : "bg-slate-900"
                    }`}
                    style={{
                      width: `${course.progress}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {course.progress}% complete
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
