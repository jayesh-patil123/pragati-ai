import React, { useEffect, useState } from "react";

function FeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
      {children}
    </span>
  );
}

export default function ChatbotPanelEnhanced() {
  const [stats] = useState([
    { label: "Active Bots", value: "7" },
    { label: "Avg. Response Time", value: "420ms" },
    { label: "Escalations/day", value: "1.2" },
  ]);

  const [tone, setTone] = useState("Friendly");
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (deploying) {
      const t = setTimeout(() => setDeploying(false), 900);
      return () => clearTimeout(t);
    }
  }, [deploying]);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">Chatbot Studio</h3>
          <p className="text-slate-600">Design, test, and deploy conversational assistants with explainability and learning metrics.</p>
        </div>
        <div className="flex gap-2">
          {stats.map((s) => (
            <div key={s.label} className="text-right">
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="font-semibold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="flex items-center justify-between font-semibold text-slate-900">Quick Deploy</h4>
          <p className="text-xs text-slate-600 mt-2">Deploy a test bot to a sandbox URL and collect user simulation data.</p>

          <div className="flex gap-2 mt-3">
            <select
              className="rounded-full border px-3 py-1 text-xs"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option>Friendly</option>
              <option>Professional</option>
              <option>Concise</option>
              <option>Playful</option>
            </select>

            <button
              onClick={() => setDeploying(true)}
              className="rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-semibold"
              disabled={deploying}
            >
              {deploying ? "Deploying..." : "Deploy to Sandbox"}
            </button>

            <button className="rounded-full border px-4 py-2 text-xs font-semibold">View Live Bots</button>
          </div>

          <div className="mt-3 text-xs text-slate-600">Unique: Auto-generates a user-simulation script (sample) so students can test edge cases quickly.</div>
        </div>

        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Explainability & Logs</h4>
          <p className="text-xs text-slate-600 mt-2">Understand why your bot answered the way it did.</p>

          <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1 mt-2">
            <li>Show token-level rationale snippets</li>
            <li>Confidence score + suggested corrections</li>
            <li>Export conversation slices for grading</li>
          </ul>

          <div className="flex gap-2 pt-2">
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">Open Logs</button>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">Export for Grading</button>
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Prompt Library</h4>
          <p className="text-xs text-slate-600 mt-2">A curated set of prompt patterns and templates students can fork and modify.</p>

          <div className="flex flex-col gap-2 mt-3">
            <div className="text-xs text-slate-600">Try templates like: Interviewer, Tutor, Debug Assistant.</div>
            <div className="flex gap-2 pt-2">
              <button className="rounded-full border px-4 py-2 text-xs font-semibold">Open Library</button>
              <button className="rounded-full border px-4 py-2 text-xs font-semibold">Create Template</button>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Curriculum Mode</h4>
          <p className="text-xs text-slate-600 mt-2">Turn bot behaviors into lesson modules and checkpoints.</p>

          <div className="text-xs text-slate-600 mt-2">Create checkpoints that measure correct responses, fallback rates, and escalation handling.</div>
          <div className="flex gap-2 pt-2">
            <button className="rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-semibold">Create Lesson</button>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold">View Lessons</button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FeatureBadge>Unique</FeatureBadge>
        <div className="text-xs text-slate-600">Interactive explanation export + curriculum integration — great for courses and portfolios.</div>
      </div>
    </div>
  );
}
