import React, { useState } from "react";

/**
 * TraineeAgentPanel.tsx (fixed)
 * - Ensures setProgress is used so ESLint no-unused-vars is satisfied
 * - Small interactive progress UI
 */

export default function TraineeAgentPanel(): React.ReactElement {
  const [progress, setProgress] = useState<number>(0);

  function advance(by = 10) {
    setProgress((p) => Math.min(100, p + by));
  }

  function retreat(by = 10) {
    setProgress((p) => Math.max(0, p - by));
  }

  function reset() {
    setProgress(0);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm text-sm">
      <h3 className="font-semibold text-slate-900">Trainee Agent</h3>
      <p className="text-xs text-slate-600 mt-1">Progress tracker and quick controls for the trainee agent.</p>

      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-1">Training progress</div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,#06b6d4,#7c3aed)" }}
          />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="text-xs text-slate-700 font-mono">{progress}%</div>
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => retreat(5)}>-5</button>
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => advance(5)}>+5</button>
          <button className="rounded-md border px-2 py-1 text-xs" onClick={() => advance(10)}>+10</button>
          <button className="rounded-md border px-2 py-1 text-xs" onClick={reset}>Reset</button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="rounded-md bg-emerald-500 text-white px-3 py-1 text-xs"
            onClick={() => alert(`(mock) Start training sequence at ${progress}%`)}
          >
            Start Training
          </button>

          <button
            className="rounded-md border px-3 py-1 text-xs"
            onClick={() => alert(`(mock) Run evaluation at ${progress}%`)}
          >
            Run Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
