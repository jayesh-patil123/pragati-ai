import { useEffect, useState } from "react"

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress?: number // 0–100
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔗 READY FOR BACKEND
    // apiClient.get("/achievements").then(res => setAchievements(res.data))

    // Mock data
    setTimeout(() => {
      setAchievements([
        {
          id: "1",
          title: "Getting Started",
          description: "Complete your first lesson.",
          unlocked: true,
        },
        {
          id: "2",
          title: "Consistent Learner",
          description: "Study for 7 consecutive days.",
          unlocked: false,
          progress: 60,
        },
        {
          id: "3",
          title: "AI Explorer",
          description: "Use AI features 10 times.",
          unlocked: false,
          progress: 30,
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading achievements...
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Achievements
        </h2>
        <p className="text-sm text-slate-600">
          Track your progress and milestones.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {achievements.map((achievement) => (
          <li
            key={achievement.id}
            className={`rounded-xl border p-4 transition ${
              achievement.unlocked
                ? "border-green-300 bg-green-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className={`font-medium ${
                    achievement.unlocked
                      ? "text-green-700"
                      : "text-slate-900"
                  }`}
                >
                  {achievement.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {achievement.description}
                </p>
              </div>

              {achievement.unlocked && (
                <span className="text-xs font-medium text-green-600">
                  Unlocked
                </span>
              )}
            </div>

            {!achievement.unlocked &&
              achievement.progress !== undefined && (
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{
                        width: `${achievement.progress}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {achievement.progress}% complete
                  </p>
                </div>
              )}
          </li>
        ))}
      </ul>
    </div>
  )
}
