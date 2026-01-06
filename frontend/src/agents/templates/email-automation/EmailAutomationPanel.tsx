import React, { useState } from "react";

/**
 * EmailAutomationPanel.tsx
 * - Tailwind CSS expected
 * - Dark-on-white color usage (text-gray-900 / text-gray-600)
 * - Small interactive demo: build a sequence, insert tokens, preview, save (mock)
 */

type Step = {
  id: number;
  subject: string;
  body: string;
  delayDays: number;
  enabled: boolean;
};

const PERSONALIZATION_TOKENS = ["{{first_name}}", "{{last_name}}", "{{company}}", "{{role}}"];

export default function EmailAutomationPanel(): React.ReactElement {
  const [steps, setSteps] = useState<Step[]>(() => [
    { id: 1, subject: "Welcome to our product, {{first_name}}", body: "Hi {{first_name}},\n\nThanks for joining. Quick tips...", delayDays: 0, enabled: true },
    { id: 2, subject: "Getting started resources", body: "Hi {{first_name}},\n\nHere are some resources to get started...", delayDays: 3, enabled: true },
  ]);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(steps[0]?.id ?? null);
  const [sequenceName, setSequenceName] = useState<string>("Onboarding Sequence");
  const [dailyLimit, setDailyLimit] = useState<number>(200);
  const [previewOpen, setPreviewOpen] = useState(false);

  function addStep() {
    setSteps(prev => {
      const nextId = prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1;
      const newStep: Step = {
        id: nextId,
        subject: "New step subject",
        body: "Write email body here...",
        delayDays: 1,
        enabled: true,
      };
      // set selected id to the new one
      setSelectedStepId(nextId);
      return [...prev, newStep];
    });
  }

  function updateStep(id: number, patch: Partial<Step>) {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeStep(id: number) {
    // Use functional updater and compute remaining using prev (no unused param)
    setSteps(prev => {
      const remaining = prev.filter(s => s.id !== id);
      // pick a sensible selected step after removal
      setSelectedStepId(remaining[0]?.id ?? null);
      return remaining;
    });
  }

  function insertTokenIntoStep(id: number, token: string) {
    setSteps(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              body:
                s.body + (s.body.endsWith("\n") || s.body.length === 0 ? "" : "\n") + token,
            }
          : s
      )
    );
  }

  function toggleStepEnabled(id: number) {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }

  function openPreview() {
    setPreviewOpen(true);
  }

  function closePreview() {
    setPreviewOpen(false);
  }

  const selectedStep = steps.find(s => s.id === selectedStepId) ?? null;
  const totalEnabled = steps.filter(s => s.enabled).length;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg border border-gray-200 text-gray-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Email Automation</h3>
          <p className="text-sm text-gray-600 mt-1">
            Design multi-step email sequences for outreach, onboarding, and follow-ups.
          </p>
        </div>

        <div className="text-right">
          <label className="text-xs text-gray-600 block">Sequence name</label>
          <input
            value={sequenceName}
            onChange={(e) => setSequenceName(e.target.value)}
            className="mt-1 text-sm rounded-md border px-2 py-1 w-56 bg-white text-gray-900"
            aria-label="Sequence name"
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: sequence list */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">Steps ({steps.length})</div>
            <div className="flex items-center gap-2">
              <button onClick={addStep} className="text-xs px-3 py-1 rounded-full bg-gray-900 text-white">+ Add Step</button>
            </div>
          </div>

          <ul className="space-y-2 max-h-64 overflow-auto">
            {steps.map((s) => (
              <li key={s.id} className={`p-2 rounded-md border ${s.id === selectedStepId ? "border-gray-300 bg-gray-50" : "border-gray-100 bg-white"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={s.enabled} onChange={() => toggleStepEnabled(s.id)} className="rounded" />
                    <button onClick={() => setSelectedStepId(s.id)} className="text-sm text-gray-900 text-left">
                      <div className="font-medium truncate max-w-xs">{s.subject}</div>
                      <div className="text-xs text-gray-600">Delay: {s.delayDays} day(s)</div>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => removeStep(s.id)} title="Remove step" className="text-xs px-2 py-1 rounded border text-gray-600">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Quick analytics mock */}
          <div className="mt-3 p-3 rounded-md border bg-gray-50 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Sequence Summary</div>
            <div className="mt-2 text-xs">
              <div>Enabled steps: <span className="font-medium text-gray-900">{totalEnabled}</span></div>
              <div className="mt-1">Daily send limit: <span className="font-medium text-gray-900">{dailyLimit}</span></div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-gray-600">Daily send limit</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Math.max(1, Number(e.target.value || 1)))}
                className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Middle: step editor */}
        <div className="md:col-span-1 bg-gray-50 p-3 rounded-md border">
          <div className="text-sm font-medium text-gray-900">Step Editor</div>

          {!selectedStep && <div className="text-sm text-gray-600 mt-2">Select a step to edit or add a new one.</div>}

          {selectedStep && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs text-gray-600">Subject</label>
                <input
                  value={selectedStep.subject}
                  onChange={(e) => updateStep(selectedStep.id, { subject: e.target.value })}
                  className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Body</label>
                <textarea
                  value={selectedStep.body}
                  onChange={(e) => updateStep(selectedStep.id, { body: e.target.value })}
                  rows={6}
                  className="mt-1 w-full rounded-md border px-2 py-1 text-sm font-mono bg-white text-gray-900"
                />
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  <div className="text-xs text-gray-600">Insert token:</div>
                  {PERSONALIZATION_TOKENS.map((t) => (
                    <button key={t} onClick={() => insertTokenIntoStep(selectedStep.id, t)} className="text-xs px-2 py-1 rounded border text-gray-700 bg-white">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs text-gray-600">Delay (days)</label>
                  <input
                    type="number"
                    value={selectedStep.delayDays}
                    onChange={(e) => updateStep(selectedStep.id, { delayDays: Math.max(0, Number(e.target.value || 0)) })}
                    className="mt-1 w-28 rounded-md border px-2 py-1 text-sm bg-white text-gray-900"
                  />
                </div>

                <div className="ml-auto flex gap-2">
                  <button onClick={() => openPreview()} className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white">Preview</button>
                  <button onClick={() => setSelectedStepId(null)} className="text-xs px-3 py-1 rounded-md border text-gray-700">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: timeline & actions */}
        <div className="md:col-span-1 space-y-3">
          <div className="p-3 rounded-md border bg-white text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Sequence Timeline</div>
            <ol className="mt-3 space-y-3">
              {steps.map((s, idx) => (
                <li key={s.id} className="flex items-start gap-3">
                  <div className="w-8 text-xs text-gray-600">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 font-medium truncate">{s.subject}</div>
                    <div className="text-xs text-gray-600">After {s.delayDays} day(s) • {s.enabled ? "Enabled" : "Disabled"}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex gap-2">
              <button onClick={() => alert("Mock save — integrate with backend")} className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white">
                Save Sequence
              </button>
              <button onClick={() => { setSteps([]); setSelectedStepId(null); }} className="text-xs px-3 py-1 rounded-md border text-gray-700">
                Clear
              </button>
              <button onClick={() => openPreview()} className="text-xs px-3 py-1 rounded-md border text-gray-700">
                Open Preview
              </button>
            </div>
          </div>

          {/* small mock analytics card */}
          <div className="p-3 rounded-md border bg-gray-50 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">Mock Analytics</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-600">Open rate</div>
                <div className="font-medium text-gray-900">42%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Reply rate</div>
                <div className="font-medium text-gray-900">6%</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Clicks</div>
                <div className="font-medium text-gray-900">18%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal (simple) */}
      {previewOpen && selectedStep && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl mx-4 p-4 bg-white rounded-md border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Preview: Step {selectedStep.id}</div>
                <div className="text-xs text-gray-600">Subject</div>
                <div className="font-medium text-gray-900">{selectedStep.subject}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={closePreview} className="text-xs px-3 py-1 rounded-md border text-gray-700">Close</button>
              </div>
            </div>

            <hr className="my-3" />

            <div className="text-sm whitespace-pre-wrap text-gray-800">{selectedStep.body}</div>

            <div className="mt-4 text-xs text-gray-600">Note: this is a preview. Tokens will be replaced with recipient data when sending.</div>
          </div>
        </div>
      )}
    </div>
  );
}
