// src/agents/your-agents/CreateAgentPanel.tsx
import * as React from "react"

export interface Agent {
  id: string
  name: string
  description?: string
  type?: string
  persona?: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
  webAccess?: boolean
  memoryEnabled?: boolean
  vectorDB?: {
    provider: string
    indexName?: string
  } | null
  permissions?: {
    visibility: "private" | "team" | "public"
    allowedUsers?: string[]
  }
  tags?: string[]
  metadata?: Record<string, unknown>
  createdAt: string
}

export default function CreateAgentPanel({
  onCreate,
  onClose,
}: {
  onCreate: (agent: Agent) => void
  onClose?: () => void
}) {
  // Basic
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState("general")

  // Persona & prompt
  const [persona, setPersona] = React.useState("")
  const [systemPrompt, setSystemPrompt] = React.useState("")

  // Model & runtime config
  const [model, setModel] = React.useState("gpt-4o-mini")
  const [temperature, setTemperature] = React.useState(0.2)
  const [maxTokens, setMaxTokens] = React.useState(1024)

  // Tools & integrations
  const [tools, setTools] = React.useState<string[]>([])
  const [webAccess, setWebAccess] = React.useState(false)
  const [memoryEnabled, setMemoryEnabled] = React.useState(false)
  const [vectorProvider, setVectorProvider] = React.useState("")
  const [vectorIndex, setVectorIndex] = React.useState("")

  // Permissions & metadata
  const [visibility, setVisibility] = React.useState<"private" | "team" | "public">("private")
  const [tags, setTags] = React.useState("")

  // UI state
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])

  // sample tool list - in real app this could be fetched
  const availableTools = [
    { id: "search", name: "Web Search" },
    { id: "browser", name: "Browser (scrape)" },
    { id: "finance", name: "Finance API" },
    { id: "email", name: "Email / SMTP" },
    { id: "calendar", name: "Calendar" },
    { id: "code_exec", name: "Code Runner" },
    { id: "file_store", name: "File Storage" },
  ]

  function toggleTool(id: string) {
    setTools((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function validate() {
    const e: string[] = []
    if (!name.trim()) e.push("Agent name is required")
    if (name.length > 80) e.push("Name must be <= 80 characters")
    if (systemPrompt.length > 5000) e.push("System prompt too long")
    if (temperature < 0 || temperature > 2) e.push("Temperature must be between 0 and 2")
    if (maxTokens < 64) e.push("Max tokens should be at least 64")
    // Example: if memory enabled, ensure vector DB configured or fallback
    if (memoryEnabled && !vectorProvider) e.push("Enable a vector DB provider when memory is enabled")
    setErrors(e)
    return e.length === 0
  }

  function create() {
    if (!validate()) return
    setSubmitting(true)

    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      type,
      persona: persona.trim() || undefined,
      systemPrompt: systemPrompt.trim() || undefined,
      model,
      temperature,
      maxTokens,
      tools,
      webAccess,
      memoryEnabled,
      vectorDB: vectorProvider
        ? { provider: vectorProvider, indexName: vectorIndex || undefined }
        : null,
      permissions: { visibility },
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metadata: {
        createdBy: "local-ui",
      },
      createdAt: new Date().toISOString(),
    }

    // Simulate async save (replace with API call)
    setTimeout(() => {
      onCreate(agent)
      setSubmitting(false)
      onClose?.()
    }, 300)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Create Agent</h3>

      {errors.length > 0 && (
        <div className="mb-3 p-3 border rounded bg-rose-50 text-rose-800">
          <strong>Fix the following:</strong>
          <ul className="list-disc pl-5 mt-2">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <label className="block text-xs text-slate-600 mb-1">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border px-3 py-2 mb-3"
        placeholder="Customer Support Bot"
        maxLength={80}
      />

      <label className="block text-xs text-slate-600 mb-1">Description (optional)</label>
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded border px-3 py-2 mb-3"
        placeholder="What does this agent do?"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border px-3 py-2 mb-3"
          >
            <option value="general">General</option>
            <option value="support">Support</option>
            <option value="research">Research</option>
            <option value="automation">Automation</option>
            <option value="sales">Sales</option>
            <option value="devops">DevOps</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Visibility</label>
          <select
            value={visibility}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVisibility(e.target.value as "private" | "team" | "public")}
            className="w-full rounded border px-3 py-2 mb-3"
          >
            <option value="private">Private</option>
            <option value="team">Team</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <label className="block text-xs text-slate-600 mb-1">Persona (short)</label>
      <input
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
        className="w-full rounded border px-3 py-2 mb-3"
        placeholder="Friendly technical support agent"
      />

      <label className="block text-xs text-slate-600 mb-1">System prompt / Instructions</label>
      <textarea
        rows={4}
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        className="w-full rounded border px-3 py-2 mb-3"
        placeholder={`You are a helpful assistant specialized in ...`}
      />

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4o-1.1">gpt-4o-1.1</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Temperature</label>
          <input
            type="number"
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-600 mb-1">Max tokens</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-slate-600 mb-1">Tools & Integrations</label>
        <div className="grid grid-cols-2 gap-2">
          {availableTools.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={tools.includes(t.id)} onChange={() => toggleTool(t.id)} />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={webAccess} onChange={() => setWebAccess((s) => !s)} /> Enable Web Access
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={memoryEnabled} onChange={() => setMemoryEnabled((s) => !s)} /> Enable Long-term Memory
        </label>
      </div>

      {memoryEnabled && (
        <div className="mb-3">
          <label className="block text-xs text-slate-600 mb-1">Vector DB Provider</label>
          <input
            value={vectorProvider}
            onChange={(e) => setVectorProvider(e.target.value)}
            className="w-full rounded border px-3 py-2 mb-2"
            placeholder="e.g. pinecone, weaviate, chroma"
          />
          <label className="block text-xs text-slate-600 mb-1">Index name (optional)</label>
          <input
            value={vectorIndex}
            onChange={(e) => setVectorIndex(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="agent-memory-v1"
          />
        </div>
      )}

      <label className="block text-xs text-slate-600 mb-1">Tags (comma separated)</label>
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full rounded border px-3 py-2 mb-3"
        placeholder="support, customer, onboarding"
      />

      <div className="flex gap-2 mt-4">
        <button
          onClick={create}
          disabled={submitting}
          className="px-4 py-2 bg-slate-900 text-white rounded"
        >
          {submitting ? "Creating…" : "Create Agent"}
        </button>

        <button onClick={() => onClose?.()} className="px-4 py-2 border rounded">Cancel</button>

        <button
          onClick={() => {
            // quick-save as draft in localStorage (example)
            const draft = {
              name,
              description,
              type,
              persona,
              systemPrompt,
              model,
              temperature,
              maxTokens,
              tools,
              webAccess,
              memoryEnabled,
              vectorProvider,
              vectorIndex,
              visibility,
              tags,
              savedAt: new Date().toISOString(),
            }
            localStorage.setItem("agent-draft", JSON.stringify(draft))
            alert("Draft saved locally")
          }}
          className="px-4 py-2 border rounded"
        >
          Save Draft
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">Pro tip: use a clear system prompt and choose the smallest model that meets your latency/cost needs.</p>
    </div>
  )
}
