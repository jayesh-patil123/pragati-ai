import React, { useState } from "react";

/**
 * ResearchTemplatePanel.tsx
 * - Tailwind CSS assumed
 * - White-background friendly (text-gray-900 / text-gray-700 / text-gray-600)
 * - Self-contained demo: topic input, depth/length controls, source list, mock generate, copy/download
 */

type Depth = "Surface" | "Standard" | "Deep";
type Length = "Short" | "Medium" | "Long";

export default function ResearchTemplatePanel(): React.ReactElement {
  const [topic, setTopic] = useState<string>("Climate change impacts on coastal cities");
  const [depth, setDepth] = useState<Depth>("Standard");
  const [length, setLength] = useState<Length>("Medium");
  const [sources, setSources] = useState<string[]>([
    "https://example.com/report-1",
    "https://example.com/paper-2",
  ]);
  const [newSource, setNewSource] = useState<string>("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  function addSource() {
    if (!newSource.trim()) return;
    setSources((s) => [...s, newSource.trim()]);
    setNewSource("");
  }

  function removeSource(idx: number) {
    setSources((s) => s.filter((_, i) => i !== idx));
  }

  function clearGenerated() {
    setGenerated(null);
  }

  function downloadTxt() {
    if (!generated) return;
    const blob = new Blob([generated], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-summary-${topic.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function generateSummary() {
    setLoading(true);
    setGenerated(null);

    // Simulated processing delay
    await new Promise((r) => setTimeout(r, 700));

    // Mock structured summary — adjust structure as needed
    const header = `Research Summary: ${topic}\nDepth: ${depth} • Length: ${length}\nSources: ${sources.length}\n\n`;
    const executive = `Executive summary\n-----------------\nA concise overview of the topic and the most important findings. This section highlights the key takeaways and the recommended next steps for stakeholders.\n\n`;
    const background = `Background\n----------\nContext and historical background about ${topic}. Brief review of prior work, major events, and why this topic matters now.\n\n`;
    const findings = `Key findings\n------------\n1. Primary finding one related to ${topic} — short explanation.\n2. Secondary finding two with supporting observations.\n3. Additional insights, caveats, and counterpoints.\n\n`;
    const analysis = `Analysis & comparisons\n----------------------\nA deeper look (depth: ${depth}) into mechanisms, contrasting studies, and methodological notes. Discuss relative strengths, limitations, and potential biases in sources.\n\n`;
    const recommendations = `Recommendations\n---------------\n- Short, actionable recommendations tailored to practitioners and decision-makers.\n- Suggested research / next steps.\n\n`;
    const appendix = `Appendix — Sources\n------------------\n${sources.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nGenerated at: ${new Date().toLocaleString()}\n`;

    // Compose length variations
    let body = "";
    if (length === "Short") {
      body = executive + recommendations;
    } else if (length === "Medium") {
      body = executive + background + findings + recommendations;
    } else {
      // Long
      body = executive + background + findings + analysis + recommendations + appendix;
    }

    setGenerated(header + body);
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg border border-gray-200 text-gray-900">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Research Agent</h3>
          <p className="text-sm text-gray-600 mt-1">Preconfigured template for deep research, comparisons, and long-form summaries.</p>
        </div>

        <div className="text-right">
          <button
            onClick={() => {
              // quick example: fill topic with a different example
              setTopic("AI governance frameworks comparison");
            }}
            className="text-xs px-3 py-1 rounded-md border text-gray-700"
          >
            Example topic
          </button>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: inputs */}
        <div className="md:col-span-1 space-y-3">
          <div>
            <label className="text-xs text-gray-600">Research topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Depth</label>
            <div className="mt-2 flex gap-2">
              {(["Surface", "Standard", "Deep"] as Depth[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={`text-xs px-3 py-1 rounded-full border ${depth === d ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Length</label>
            <div className="mt-2 flex gap-2">
              {(["Short", "Medium", "Long"] as Length[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={`text-xs px-3 py-1 rounded-full border ${length === l ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Sources</label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Paste source URL or title"
                  className="flex-1 text-sm rounded-md border px-2 py-1 bg-white text-gray-900"
                />
                <button onClick={addSource} className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white">Add</button>
              </div>

              <ul className="mt-2 text-xs space-y-1 max-h-32 overflow-auto">
                {sources.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-white">
                    <div className="truncate text-gray-800 text-sm">{s}</div>
                    <button onClick={() => removeSource(i)} className="text-xs px-2 py-1 rounded border text-gray-700">Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="flex gap-2">
              <button
                onClick={generateSummary}
                disabled={loading}
                className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white"
              >
                {loading ? "Generating..." : "Generate Summary"}
              </button>

              <button
                onClick={clearGenerated}
                disabled={!generated}
                className="text-sm px-4 py-2 rounded-md border text-gray-700"
              >
                Clear
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              This demo produces a structured mock summary. Replace `generateSummary` with an API call to your research agent for real output.
            </div>
          </div>
        </div>

        {/* Right: output preview */}
        <div className="md:col-span-2 space-y-3">
          <div className="p-3 rounded-md border bg-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Preview</div>
                <div className="text-xs text-gray-600">Rendered output (mock)</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!generated) return;
                    navigator.clipboard?.writeText(generated);
                  }}
                  disabled={!generated}
                  className="text-xs px-3 py-1 rounded-md border text-gray-700"
                >
                  Copy
                </button>

                <button
                  onClick={downloadTxt}
                  disabled={!generated}
                  className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white"
                >
                  Download TXT
                </button>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-md bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap min-h-[160px]">
              {generated ? generated : "No summary generated yet — set topic, depth, sources and press Generate Summary."}
            </div>
          </div>

          <div className="p-3 rounded-md border bg-gray-50 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Notes & Options</div>
            <ul className="mt-2 list-disc pl-5 text-xs space-y-1">
              <li>Adjust depth to change the analysis level (Surface → Deep).</li>
              <li>Use the Sources box to prioritize or ignore particular references.</li>
              <li>Integrate with a backend agent to replace the mock generator with real responses.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
