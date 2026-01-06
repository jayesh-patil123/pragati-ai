import React, { useState } from "react";

export default function LearningSandboxPanelEnhanced() {
  const [leftResp, setLeftResp] = useState<string | null>(null);
  const [rightResp, setRightResp] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const runComparison = () => {
    setRunning(true);
    setLeftResp(null);
    setRightResp(null);
    setTimeout(() => {
      setLeftResp("Response A — explains step-by-step with examples.");
      setRightResp("Response B — concise, lists the main points.");
      setRunning(false);
    }, 700);
  };

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="font-semibold text-slate-900">Learning Sandbox — Compare & Grade</h3>
        <p className="text-slate-600">Experiment with prompts, measure differences, and grade outputs with rubrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">A/B Prompt Compare</h4>
          <p className="text-xs text-slate-600 mt-2">Run two prompts side-by-side and highlight differences automatically.</p>

          <div className="flex gap-2 mt-3">
            <button className="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold" onClick={runComparison}>
              {running ? "Running..." : "Run Comparison"}
            </button>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">Save Experiment</button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2 border rounded">{leftResp ?? <span className="text-slate-400">No result yet</span>}</div>
            <div className="p-2 border rounded">{rightResp ?? <span className="text-slate-400">No result yet</span>}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Rubric Grader</h4>
          <p className="text-xs text-slate-600 mt-2">Define a rubric and auto-score model outputs — great for teachers to grade student agents.</p>

          <div className="text-xs text-slate-600 mt-2">Create criteria (accuracy, helpfulness, citations) and run batch evaluations.</div>
          <div className="flex gap-2 pt-2">
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">Open Rubric</button>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">Batch Evaluate</button>
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Simulated Users</h4>
          <p className="text-xs text-slate-600 mt-2">Generate user personas and edge-case utterances to stress-test agents.</p>

          <div className="text-xs text-slate-600 mt-2">Unique: Persona templates (novice, expert, frustrated) let learners see failure modes quickly.</div>
          <div className="flex gap-2 pt-2">
            <button className="rounded-full bg-sky-600 text-white px-4 py-2 text-xs font-semibold">Generate Persona</button>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">Inject into Test</button>
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Promote to Agent</h4>
          <p className="text-xs text-slate-600 mt-2">One-click promotion from sandbox experiment to a versioned agent with notes and changelog.</p>

          <div className="flex gap-2 pt-2">
            <button className="rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-semibold">Promote</button>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">View Changelog</button>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600">Pro tip: Save experiments as classroom assignments so students can fork and repeat your setups.</div>
    </div>
  );
}
