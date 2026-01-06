import * as React from "react"

interface Metric {
  name: string
  value: number
}

export default function AnalyzerPanel() {
  const [evaluating, setEvaluating] = React.useState(false)
  const [metrics, setMetrics] = React.useState<Metric[]>([])

  const runEvaluation = () => {
    setEvaluating(true)

    setTimeout(() => {
      setMetrics([
        { name: "Accuracy", value: 92 },
        { name: "Precision", value: 88 },
        { name: "Recall", value: 85 },
        { name: "F1 Score", value: 86 },
      ])
      setEvaluating(false)
    }, 1500)
  }

  return (
    <section className="w-full rounded-2xl border bg-white p-6 space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-gray-900">
          AI Model Evaluation Lab
        </h3>
        <p className="text-xs text-gray-600">
          Test how well your AI model performs on real data.
        </p>
      </header>

      <button
        onClick={runEvaluation}
        disabled={evaluating}
        className="rounded-full bg-black text-white px-5 py-2 text-xs disabled:opacity-50"
      >
        {evaluating ? "Evaluating Model..." : "Run Evaluation"}
      </button>

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border bg-gray-50 p-4 text-center"
            >
              <p className="text-xs text-gray-500">{m.name}</p>
              <p className="text-lg font-bold text-gray-900">
                {m.value}%
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
