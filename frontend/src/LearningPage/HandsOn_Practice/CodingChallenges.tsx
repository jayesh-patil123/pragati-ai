// frontend/src/LearningPage/HandsOn_Practice/CodingChallenges.tsx

import React, { useMemo, useState } from "react"

/* ------------------------------------------------------------------
 * Inline SVG Icons (no external dependency)
 * ------------------------------------------------------------------ */

const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
)

const CopyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" />
  </svg>
)

const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M5 20h14v-2H5v2zM12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L12 13.17V3z" />
  </svg>
)

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type TestCase = {
  input: unknown[]
  expected: unknown
}

type Problem = {
  id: string
  title: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  description: string
  template: string
  fnName: string
  tests: TestCase[]
}

/* ------------------------------------------------------------------
 * Utility
 * ------------------------------------------------------------------ */

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

export default function CodingChallenges(): React.JSX.Element {
  const problems = useMemo<Problem[]>(() => [
    {
      id: "knn",
      title: "Implement k-NN from scratch",
      difficulty: "Advanced",
      description:
        "Write a JavaScript function predictKNN(train, testPoint, k) → label using Euclidean distance.",
      template: `function predictKNN(train, testPoint, k) {
  const distances = train.map(t => ({
    d: Math.sqrt(
      t.x.reduce((sum, v, i) => sum + (v - testPoint[i]) ** 2, 0)
    ),
    label: t.y
  }));

  distances.sort((a, b) => a.d - b.d);

  const counts = {};
  for (const item of distances.slice(0, k)) {
    counts[item.label] = (counts[item.label] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0][0];
}`,
      fnName: "predictKNN",
      tests: [
        {
          input: [
            [
              { x: [0, 0], y: 0 },
              { x: [1, 1], y: 1 },
              { x: [0.9, 1.1], y: 1 },
            ],
            [0.8, 0.9],
            3,
          ],
          expected: "1",
        },
      ],
    },
    {
      id: "metrics",
      title: "Compute confusion matrix & F1-score",
      difficulty: "Beginner",
      description:
        "Implement metrics(trueLabels, predLabels) → tp, fp, tn, fn, precision, recall, f1.",
      template: `function metrics(trueLabels, predLabels) {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < trueLabels.length; i++) {
    const t = trueLabels[i];
    const p = predLabels[i];

    if (t === 1 && p === 1) tp++;
    else if (t === 0 && p === 1) fp++;
    else if (t === 0 && p === 0) tn++;
    else if (t === 1 && p === 0) fn++;
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 =
    precision + recall === 0
      ? 0
      : (2 * precision * recall) / (precision + recall);

  return { tp, fp, tn, fn, precision, recall, f1 };
}`,
      fnName: "metrics",
      tests: [
        {
          input: [[1, 0, 1, 1], [1, 0, 0, 1]],
          expected: { f1: 0.8 },
        },
      ],
    },
  ], [])

  const [selectedProblem, setSelectedProblem] = useState<Problem>(problems[0])
  const [code, setCode] = useState(problems[0].template)
  const [output, setOutput] = useState<string | null>(null)

  function selectProblem(problem: Problem) {
    setSelectedProblem(problem)
    setCode(problem.template)
    setOutput(null)
  }

  function executeUserCode(code: string, fnName: string, args: unknown[]) {
    try {
      const runner = new Function(
        "args",
        `"use strict";
         ${code}
         if (typeof ${fnName} !== "function") {
           throw new Error("Function ${fnName} not found");
         }
         return ${fnName}.apply(null, args);`
      )

      return { ok: true as const, result: runner(args) }
    } catch (err) {
      return {
        ok: false as const,
        error: (err as Error).message,
      }
    }
  }

  function runTests() {
    const results = selectedProblem.tests.map((test, i) => {
      const res = executeUserCode(code, selectedProblem.fnName, test.input)

      if (!res.ok) {
        return `Test ${i + 1}: ERROR — ${res.error}`
      }

      const pass = deepEqual(res.result, test.expected)
      return `Test ${i + 1}: ${pass ? "PASS" : "FAIL"}`
    })

    setOutput(results.join("\n"))
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setOutput("Copied to clipboard.")
    } catch {
      setOutput("Copy failed.")
    }
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <h3 className="text-base font-semibold mb-3">
        Coding Challenges – Hands-On Practice
      </h3>

      <div className="flex gap-4">
        <aside className="w-64 shrink-0">
          <ul className="space-y-2">
            {problems.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => selectProblem(p)}
                  className={`w-full p-2 rounded text-left ${
                    p.id === selectedProblem.id
                      ? "bg-slate-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.difficulty}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1">
          <p className="text-sm mb-2">{selectedProblem.description}</p>

          <div className="flex gap-2 mb-3">
            <button
              onClick={runTests}
              className="inline-flex gap-2 px-3 py-1.5 rounded bg-indigo-600 text-white text-sm"
            >
              <PlayIcon /> Run Tests
            </button>

            <button
              onClick={() => copyToClipboard(code)}
              className="inline-flex gap-2 px-3 py-1.5 rounded border text-sm"
            >
              <CopyIcon /> Copy Template
            </button>

            <a
              download={`${selectedProblem.id}.js`}
              href={`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`}
              className="inline-flex gap-2 px-3 py-1.5 rounded border text-sm"
            >
              <DownloadIcon /> Download
            </a>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 border rounded p-2 font-mono text-xs"
          />

          <pre className="mt-3 bg-slate-50 p-3 rounded text-xs min-h-16">
            {output ?? "(no output)"}
          </pre>
        </main>
      </div>
    </div>
  )
}
