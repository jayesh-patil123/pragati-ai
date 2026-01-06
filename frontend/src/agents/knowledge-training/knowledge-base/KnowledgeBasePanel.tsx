import React, { useEffect, useRef, useState } from "react";

/**
 * KnowledgeBasePanel.tsx (fixed)
 * - Ensures all setters are used where appropriate so ESLint doesn't report unused-vars
 * - Removes `any` usage (uses `unknown` guards instead)
 * - Uses canonical Tailwind classes (e.g., `shrink-0`)
 */

type SourceType = "pdf" | "url" | "doc" | "slides";

type SourceItem = {
  id: string;
  title: string;
  excerpt: string;
  confidence: number; // 0-100
  type: SourceType;
  uploadedAt: string; // ISO date
  author?: string;
};

export default function KnowledgeBasePanel(): React.ReactElement {
  const [sources, setSources] = useState<SourceItem[]>(() => {
    try {
      const raw = localStorage.getItem("kb_sources_v1");
      return raw ? JSON.parse(raw) : sampleSources();
    } catch {
      return sampleSources();
    }
  });

  const [freshness, setFreshness] = useState<string>(() => localStorage.getItem("kb_freshness_v1") ?? "7 days");
  const [dragActive, setDragActive] = useState(false);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<SourceType | "all">("all");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage.setItem("kb_sources_v1", JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem("kb_freshness_v1", freshness);
  }, [freshness]);

  // Using setFilterType in a small helper so ESLint recognizes it's used even if we later derive a URL param from it
  function updateFilterType(next: SourceType | "all") {
    setFilterType(next);
    // Potential place to reflect filter in URL or analytics
    // e.g. history.replaceState(null, "", `?type=${next}`);
  }

  const filtered = sources.filter((s) => (filterType === "all" ? true : s.type === filterType) &&
    (s.title.toLowerCase().includes(query.toLowerCase()) || s.excerpt.toLowerCase().includes(query.toLowerCase())));

  function addMockSource(item: Omit<SourceItem, "id" | "uploadedAt">) {
    const newItem: SourceItem = {
      id: cryptoRandomId(),
      uploadedAt: new Date().toISOString(),
      ...item,
    };
    setSources((s) => [newItem, ...s]);
  }

  function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).map((f) => ({
      title: f.name,
      excerpt: `Auto-extracted excerpt from ${f.name} (mock).`,
      confidence: Math.floor(70 + Math.random() * 30),
      type: detectTypeFromFilename(f.name),
      author: undefined,
    }));

    arr.forEach((a) => addMockSource(a));
    setDragActive(false);
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onFilesSelected(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }

  function removeSource(id: string) {
    setSources((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Knowledge Base + Smart Index</h3>
          <p className="text-slate-600">Create searchable, attributed knowledge collections that agents can cite and learn from.</p>
        </div>

        <div className="text-right text-xs text-slate-500">
          Sources: <strong className="text-slate-900">{sources.length}</strong>
          <div>Freshness: <strong className="text-slate-900 ml-1">{freshness}</strong></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white md:col-span-2">
          <div className="flex gap-2 items-center">
            <input
              aria-label="Search knowledge base"
              placeholder="Search titles or excerpts..."
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button
              className="rounded-md border px-3 py-2 text-xs font-semibold"
              onClick={() => {
                setQuery("");
              }}
            >
              Clear
            </button>

            <div className="ml-auto text-xs text-slate-500">Showing <strong className="text-slate-900">{filtered.length}</strong> results</div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((s) => (
              <article key={s.id} className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                    <div className="text-xs text-slate-500">{s.type.toUpperCase()} • {new Date(s.uploadedAt).toLocaleDateString()}</div>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3">{s.excerpt}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="text-xs text-slate-500">Confidence:</div>
                      <div className="text-xs font-mono text-slate-900">{s.confidence}%</div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <button
                      className="rounded-full border px-3 py-1 text-xs mb-2"
                      onClick={() => alert(`(mock) Generate Quiz for "${s.title}"`)}
                    >
                      Generate Quiz
                    </button>

                    <button
                      className="rounded-full border px-3 py-1 text-xs mb-2"
                      onClick={() => alert(`(mock) Export "${s.title}" to LMS`)}
                    >
                      Export to LMS
                    </button>

                    <button title="Remove" className="rounded-full border px-3 py-1 text-xs text-red-600" onClick={() => removeSource(s.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {filtered.length === 0 && <div className="col-span-full p-4 text-xs text-slate-500">No results. Try changing the filters or uploading content.</div>}
          </div>
        </div>

        <aside className="p-4 rounded-2xl shadow-sm border border-slate-100 bg-white">
          <h4 className="font-semibold text-slate-900">Quick Uploads</h4>
          <p className="text-xs text-slate-600 mt-2">Drag & drop PDFs, slide decks, and web links. Automatically extracts sections and generates suggested quiz questions.</p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`mt-3 rounded-md border-dashed border-2 p-3 text-xs ${dragActive ? "border-slate-700" : "border-slate-200"}`}
          >
            <div className="flex flex-col gap-2">
              <div>Drop files here or</div>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs">
                  Choose Files
                </button>

                <button
                  className="rounded-full border px-3 py-1 text-xs"
                  onClick={() => addMockSource({ title: "Example URL: AI paper", excerpt: "Excerpt from an external URL (mock)", confidence: 88, type: "url" })}
                >
                  Add Example URL
                </button>
              </div>
            </div>

            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => onFilesSelected(e.target.files)} />
          </div>

          <hr className="my-3" />

          <div>
            <h5 className="text-xs font-semibold">Settings</h5>
            <label className="mt-2 block text-xs text-slate-600">Freshness</label>
            <select className="rounded-md border px-2 py-1 text-xs w-full" value={freshness} onChange={(e) => setFreshness(e.target.value)}>
              <option>1 day</option>
              <option>3 days</option>
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
            </select>

            <label className="mt-3 block text-xs text-slate-600">Filter by type</label>
            <select className="rounded-md border px-2 py-1 text-xs w-full" value={filterType} onChange={(e) => updateFilterType(e.target.value as SourceType | "all") }>
              <option value="all">All</option>
              <option value="pdf">PDF</option>
              <option value="slides">Slides</option>
              <option value="url">URL</option>
              <option value="doc">Doc</option>
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ------------------ Utility & Mock Data ------------------

function cryptoRandomId(): string {
  // prefer crypto.randomUUID when available without using `any`
  const globalCrypto = (globalThis as unknown as { crypto?: { randomUUID?: unknown } }).crypto;
  if (globalCrypto && typeof globalCrypto.randomUUID === "function") {
    // safe cast because of the guard above
    return (globalCrypto as { randomUUID: () => string }).randomUUID();
  }
  return Math.random().toString(36).slice(2, 9);
}

function detectTypeFromFilename(name: string): SourceType {
  const low = name.toLowerCase();
  if (low.endsWith(".pdf")) return "pdf";
  if (low.endsWith(".ppt") || low.endsWith(".pptx")) return "slides";
  if (low.endsWith(".doc") || low.endsWith(".docx")) return "doc";
  return "pdf";
}

function sampleSources(): SourceItem[] {
  return [
    {
      id: "s1",
      title: "Intro to Pragati AI - Handbook",
      excerpt: "This handbook covers the platform, data ingestion, and responsible AI guidelines...",
      confidence: 92,
      type: "pdf",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      author: "Team Pragati",
    },
    {
      id: "s2",
      title: "Onboarding Slides: Knowledge Training",
      excerpt: "Slides that explain indexing, chunking, and citation-aware retrieval...",
      confidence: 87,
      type: "slides",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
      id: "s3",
      title: "External: Recent AI Safety Report",
      excerpt: "An analysis of emergent behaviour and alignment in current LLMs...",
      confidence: 78,
      type: "url",
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      author: "Research Lab",
    },
  ];
}
