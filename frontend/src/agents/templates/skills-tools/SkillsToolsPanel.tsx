import React, { useState } from "react";

/**
 * Enhanced SkillsToolsPanel.tsx
 *
 * Features:
 * - Add/remove skills
 * - Add/remove tools with category, version history
 * - Drag-and-drop ordering for skills & tools (HTML5)
 * - Test Tool modal (mock request/response)
 * - Export loadout to JSON (download)
 * - White-background friendly (text-gray-900 etc)
 *
 * No external libraries required.
 */

/* ----------------------------- Types ----------------------------- */

type Skill = { id: number; name: string };
type ToolCategory = "API" | "Scraper" | "Internal" | "ML Model" | "Other";

type Tool = {
  id: number;
  name: string;
  versions: string[]; // version history, latest first
  visibleVersion: string; // currently selected version
  enabled: boolean;
  permission: "read" | "write" | "admin";
  category: ToolCategory;
};

/* ---------------------------- Component ---------------------------- */

export default function SkillsToolsPanel(): React.ReactElement {
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: "Data Extraction" },
    { id: 2, name: "Summarization" },
    { id: 3, name: "Entity Recognition" },
  ]);

  const [tools, setTools] = useState<Tool[]>([
    {
      id: 1,
      name: "Google Search API",
      versions: ["v1.2", "v1.1", "v1.0"],
      visibleVersion: "v1.2",
      enabled: true,
      permission: "read",
      category: "API",
    },
    {
      id: 2,
      name: "OpenWeather API",
      versions: ["v1.0"],
      visibleVersion: "v1.0",
      enabled: false,
      permission: "read",
      category: "API",
    },
  ]);

  // Skill & Tool form state
  const [newSkill, setNewSkill] = useState("");
  const [newToolName, setNewToolName] = useState("");
  const [newToolVersion, setNewToolVersion] = useState("v1.0");
  const [newToolCategory, setNewToolCategory] = useState<ToolCategory>("API");

  // Drag-and-drop state
  const [draggingSkillId, setDraggingSkillId] = useState<number | null>(null);
  const [draggingToolId, setDraggingToolId] = useState<number | null>(null);

  // Test Tool modal
  const [testModalToolId, setTestModalToolId] = useState<number | null>(null);
  const [testInput, setTestInput] = useState<string>("");
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testing, setTesting] = useState<boolean>(false);

  /* ----------------------- Skills functions ----------------------- */

  function addSkill() {
    const name = newSkill.trim();
    if (!name) return;
    setSkills((prev) => [...prev, { id: Date.now(), name }]);
    setNewSkill("");
  }

  function removeSkill(id: number) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function onSkillDragStart(e: React.DragEvent, id: number) {
    setDraggingSkillId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onSkillDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    if (draggingSkillId === null || draggingSkillId === id) return;
    setSkills((prev) => {
      const fromIndex = prev.findIndex((s) => s.id === draggingSkillId);
      const toIndex = prev.findIndex((s) => s.id === id);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  }

  function onSkillDragEnd() {
    setDraggingSkillId(null);
  }

  /* ------------------------ Tools functions ----------------------- */

  function addTool() {
    const name = newToolName.trim();
    const version = newToolVersion.trim() || "v1.0";
    if (!name) return;
    const id = Date.now();
    const tool: Tool = {
      id,
      name,
      versions: [version],
      visibleVersion: version,
      enabled: true,
      permission: "read",
      category: newToolCategory,
    };
    setTools((prev) => [...prev, tool]);
    setNewToolName("");
    setNewToolVersion("v1.0");
    setNewToolCategory("API");
  }

  function removeTool(id: number) {
    setTools((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleToolEnabled(id: number) {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  }

  function changeToolPermission(id: number, permission: Tool["permission"]) {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, permission } : t)));
  }

  function addToolVersion(id: number, version: string) {
    if (!version.trim()) return;
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, versions: [version.trim(), ...t.versions], visibleVersion: version.trim() } : t))
    );
  }

  function setVisibleVersion(id: number, version: string) {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, visibleVersion: version } : t)));
  }

  function onToolDragStart(e: React.DragEvent, id: number) {
    setDraggingToolId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onToolDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    if (draggingToolId === null || draggingToolId === id) return;
    setTools((prev) => {
      const fromIndex = prev.findIndex((t) => t.id === draggingToolId);
      const toIndex = prev.findIndex((t) => t.id === id);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  }

  function onToolDragEnd() {
    setDraggingToolId(null);
  }

  /* ---------------------- Test Tool modal ------------------------ */

  function openTestModal(toolId: number) {
    setTestModalToolId(toolId);
    setTestInput("");
    setTestOutput(null);
  }

  async function runTestTool() {
    if (testModalToolId === null) return;
    setTesting(true);
    setTestOutput(null);

    // simulate processing
    await new Promise((r) => setTimeout(r, 700));
    const tool = tools.find((t) => t.id === testModalToolId);
    const version = tool?.visibleVersion ?? "unknown";
    // simulated output: echo plus metadata
    setTestOutput(
      `Tool: ${tool?.name ?? "unknown"}\nVersion: ${version}\nPermission: ${tool?.permission ?? "-"}\nCategory: ${
        tool?.category ?? "-"
      }\n\nInput:\n${testInput}\n\nOutput:\nSimulated response for demo purposes. (Length: ${testInput.length})`
    );
    setTesting(false);
  }

  /* ---------------------- Export loadout ------------------------- */

  function exportLoadout() {
    const payload = { skills, tools };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-loadout-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* --------------------------- Render --------------------------- */

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg border border-gray-200 text-gray-900 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skills & Tools</h3>
          <p className="text-sm text-gray-600 mt-1">Manage reusable skills and integrations for your agents.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={exportLoadout} className="text-sm px-3 py-1 rounded-md bg-gray-900 text-white">
            Export Loadout (JSON)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Skills column */}
        <div>
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-900">Skills</div>
            <div className="text-xs text-gray-600">Drag to reorder</div>
          </div>

          <div className="mt-3 p-3 rounded-lg border bg-gray-50 space-y-3">
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g., OCR)"
                className="flex-1 text-sm border rounded-md px-2 py-1 bg-white text-gray-900"
              />
              <button onClick={addSkill} className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white">
                Add
              </button>
            </div>

            <ul className="space-y-2">
              {skills.map((s) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={(e) => onSkillDragStart(e, s.id)}
                  onDragOver={(e) => onSkillDragOver(e, s.id)}
                  onDragEnd={onSkillDragEnd}
                  className="p-2 rounded-md bg-white border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-800">{s.name}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => removeSkill(s.id)} className="text-xs px-2 py-1 border rounded text-gray-700">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tools column */}
        <div>
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-900">Tools & Integrations</div>
            <div className="text-xs text-gray-600">Drag to reorder</div>
          </div>

          <div className="mt-3 p-3 rounded-lg border bg-gray-50 space-y-3">
            <div className="space-y-2">
              <input
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="Tool name (e.g., Stripe API)"
                className="w-full text-sm border rounded-md px-2 py-1 bg-white text-gray-900"
              />

              <div className="flex gap-2">
                <input
                  value={newToolVersion}
                  onChange={(e) => setNewToolVersion(e.target.value)}
                  placeholder="Version (e.g., v1.0)"
                  className="w-28 text-sm border rounded-md px-2 py-1 bg-white text-gray-900"
                />

                <select
                  value={newToolCategory}
                  onChange={(e) => setNewToolCategory(e.target.value as ToolCategory)}
                  className="text-sm border rounded-md px-2 py-1 bg-white text-gray-900"
                >
                  <option>API</option>
                  <option>Scraper</option>
                  <option>Internal</option>
                  <option>ML Model</option>
                  <option>Other</option>
                </select>

                <button onClick={addTool} className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white">
                  Add Tool
                </button>
              </div>
            </div>

            <ul className="space-y-3 max-h-[38vh] overflow-auto">
              {tools.map((t) => (
                <li
                  key={t.id}
                  draggable
                  onDragStart={(e) => onToolDragStart(e, t.id)}
                  onDragOver={(e) => onToolDragOver(e, t.id)}
                  onDragEnd={onToolDragEnd}
                  className="p-3 rounded-md bg-white border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 truncate">{t.name}</div>
                        <div className="text-xs text-gray-600">• {t.category}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Visible version: {t.visibleVersion}</div>

                      {/* versions dropdown */}
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <select
                          value={t.visibleVersion}
                          onChange={(e) => setVisibleVersion(t.id, e.target.value)}
                          className="text-xs border rounded-md px-2 py-1 bg-white text-gray-900"
                        >
                          {t.versions.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>

                        <input
                          placeholder="Add version (e.g., v1.3)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addToolVersion(t.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                          className="text-xs border rounded-md px-2 py-1 bg-white text-gray-900"
                        />
                        <button
                          onClick={() => openTestModal(t.id)}
                          className="text-xs px-2 py-1 rounded-md border text-gray-700"
                        >
                          Test
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => toggleToolEnabled(t.id)}
                        className={`text-xs px-2 py-1 rounded-md border ${
                          t.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.enabled ? "Enabled" : "Disabled"}
                      </button>

                      <div className="flex gap-1">
                        {(["read", "write", "admin"] as Tool["permission"][]).map((p) => (
                          <button
                            key={p}
                            onClick={() => changeToolPermission(t.id, p)}
                            className={`text-xs px-2 py-1 rounded-md border ${t.permission === p ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button onClick={() => removeTool(t.id)} className="text-xs px-2 py-1 rounded-md border text-gray-700">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Preview column */}
        <div>
          <div className="font-medium text-gray-900">Agent Loadout Preview</div>

          <div className="mt-3 p-3 rounded-lg border bg-white space-y-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Skills</div>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {skills.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-900">Tools</div>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {tools.map((t) => (
                  <li key={t.id}>
                    {t.name} — {t.visibleVersion} — {t.enabled ? "Enabled" : "Disabled"} • {t.permission}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button onClick={() => alert("Apply loadout (mock)")} className="text-sm px-3 py-1 rounded-md bg-gray-900 text-grey">
                Apply Loadout
              </button>

              <button onClick={exportLoadout} className="text-sm px-3 py-1 rounded-md border text-gray-700">
                Export JSON
              </button>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-lg border bg-gray-50 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Tips</div>
            <ul className="list-disc pl-5 mt-2 text-xs">
              <li>Use drag-and-drop to order skills & tools for your agent priority.</li>
              <li>Use version history to roll back or preview older tool versions.</li>
              <li>Test tools locally using the Test modal before enabling them for agents.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Tool Modal */}
      {testModalToolId !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  Test Tool — {tools.find((t) => t.id === testModalToolId)?.name ?? "Unknown"}
                </div>
                <div className="text-xs text-gray-600">
                  Version: {tools.find((t) => t.id === testModalToolId)?.visibleVersion ?? "-"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTestModalToolId(null);
                    setTestOutput(null);
                  }}
                  className="text-xs px-3 py-1 rounded-md border text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="text-xs text-gray-600">Input</label>
              <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} rows={4} className="w-full text-sm font-mono border rounded-md p-2 bg-white text-gray-900" />

              <div className="flex gap-2">
                <button onClick={runTestTool} disabled={testing} className="text-sm px-3 py-1 rounded-md bg-gray-900 text-white">
                  {testing ? "Running..." : "Run Test"}
                </button>

                <button
                  onClick={() => {
                    setTestInput("");
                    setTestOutput(null);
                  }}
                  className="text-sm px-3 py-1 rounded-md border text-gray-700"
                >
                  Reset
                </button>
              </div>

              <div className="mt-2">
                <div className="text-xs text-gray-600">Output (simulated)</div>
                <div className="mt-1 p-2 rounded-md border bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap min-h-[80px]">
                  {testOutput ?? "No output yet — run the test to see a simulated response."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
