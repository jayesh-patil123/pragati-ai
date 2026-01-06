import { useEffect, useState } from "react"

interface HelpArticle {
  id: string
  question: string
  answer: string
}

export default function HelpPage() {
  // ✅ Hooks unconditionally
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔗 READY FOR BACKEND
    // apiClient.get("/help").then(res => setArticles(res.data))

    // Mock data
    setTimeout(() => {
      setArticles([
        {
          id: "1",
          question: "How do I reset my password?",
          answer:
            "Go to Settings → Security → Change Password and follow the instructions.",
        },
        {
          id: "2",
          question: "How do I enable two-factor authentication?",
          answer:
            "Open Settings → Security → Two-Factor Authentication to enable 2FA.",
        },
        {
          id: "3",
          question: "How can I contact support?",
          answer:
            "Use the Support section in Settings to raise a ticket with our team.",
        },
      ])
      setLoading(false)
    }, 400)
  }, [])

  const filteredArticles = articles.filter(
    (article) =>
      article.question
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      article.answer
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading help articles...
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Help & FAQs
        </h2>
        <p className="text-sm text-slate-600">
          Find answers to common questions.
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search help articles..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
      />

      {/* Articles */}
      {filteredArticles.length === 0 ? (
        <p className="text-sm text-slate-500">
          No articles match your search.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredArticles.map((article) => {
            const expanded = expandedId === article.id

            return (
              <li
                key={article.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(
                      expanded ? null : article.id
                    )
                  }
                  className="w-full text-left"
                >
                  <p className="font-medium text-slate-900">
                    {article.question}
                  </p>
                </button>

                {expanded && (
                  <p className="mt-2 text-sm text-slate-600">
                    {article.answer}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
