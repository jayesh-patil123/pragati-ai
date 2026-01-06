import { useCallback, useMemo, useRef, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow"
import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  NodeProps,
} from "reactflow"
import { nanoid } from "nanoid"
import "reactflow/dist/style.css"

/* =========================================================
   TYPES
========================================================= */

type DrawerGroup =
  | "Triggers"
  | "Data & Ingestion"
  | "Logic & Flow Control"
  | "AI / LLM"
  | "Utilities"

type RightDrawerGroup =
  | "App Connectors"
  | "Orchestration"
  | "Monitoring & Reliability"

type NodeKind =
  | "trigger"
  | "ingestion"
  | "logic"
  | "ai"
  | "utility"
  | "connector"
  | "orchestration"
  | "monitor"

type NodeConfig =
  | { expression?: string }
  | { model?: string }
  | { endpoint?: string }
  | Record<string, never>

type WorkflowNodeData = {
  label: string
  kind: NodeKind
  group: string
  config: NodeConfig
  running: boolean
}

/* =========================================================
   DRAWERS
========================================================= */

const LEFT_DRAWER: Record<
  DrawerGroup,
  Array<{ label: string; kind: NodeKind }>
> = {
  Triggers: [
    { label: "Manual Trigger", kind: "trigger" },
    { label: "Webhook Trigger", kind: "trigger" },
    { label: "Schedule / Cron", kind: "trigger" },
  ],
  "Data & Ingestion": [
    { label: "HTTP Request", kind: "ingestion" },
    { label: "Parse JSON", kind: "ingestion" },
    { label: "Transform Data", kind: "ingestion" },
  ],
  "Logic & Flow Control": [
    { label: "If / Else", kind: "logic" },
    { label: "Loop", kind: "logic" },
    { label: "Merge", kind: "logic" },
    { label: "Delay", kind: "logic" },
  ],
  "AI / LLM": [
    { label: "LLM Prompt", kind: "ai" },
    { label: "AI Agent", kind: "ai" },
    { label: "Text Classifier", kind: "ai" },
  ],
  Utilities: [
    { label: "Set Variable", kind: "utility" },
    { label: "Date & Time", kind: "utility" },
  ],
}

const RIGHT_DRAWER: Record<
  RightDrawerGroup,
  Array<{ label: string; kind: NodeKind }>
> = {
  "App Connectors": [
    { label: "Database", kind: "connector" },
    { label: "Slack", kind: "connector" },
    { label: "Email", kind: "connector" },
  ],
  Orchestration: [
    { label: "Sub Workflow", kind: "orchestration" },
    { label: "Parallel Branch", kind: "orchestration" },
  ],
  "Monitoring & Reliability": [
    { label: "Execution Logs", kind: "monitor" },
    { label: "Retry", kind: "monitor" },
    { label: "Failure Alert", kind: "monitor" },
  ],
}

/* =========================================================
   HELPERS
========================================================= */

function defaultConfig(kind: NodeKind): NodeConfig {
  if (kind === "logic") return { expression: "" }
  if (kind === "ai") return { model: "gpt-4.1" }
  if (kind === "connector") return { endpoint: "" }
  return {}
}

/* =========================================================
   NODE UI
========================================================= */

function EnterpriseNode({ id, data }: NodeProps<WorkflowNodeData>) {
  return (
    <div
      className={`relative w-[180px] rounded-md border bg-white px-3 py-2 text-[11px] shadow-sm ${
        data.running
          ? "border-green-500 ring-2 ring-green-300"
          : "border-slate-300"
      }`}
    >
      <button
        onClick={() =>
          document.dispatchEvent(
            new CustomEvent("delete-node", { detail: id })
          )
        }
        className="absolute right-1 top-1 text-[10px] text-slate-400 hover:text-red-500"
      >
        ✕
      </button>

      <Handle type="target" position={Position.Left} />
      <div className="font-medium truncate">{data.label}</div>
      <div className="mt-1 text-[10px] text-slate-400 truncate">
        {data.group}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

/* =========================================================
   MAIN PANEL
========================================================= */

export default function WorkflowAutomationPanel() {
  const [nodes, setNodes] = useState<Node<WorkflowNodeData>[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const nodeTypes = useMemo(() => ({ enterprise: EnterpriseNode }), [])

  /* ---------- Delete ---------- */

  useMemo(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      setNodes((n) => n.filter((x) => x.id !== id))
      setEdges((e) => e.filter((x) => x.source !== id && x.target !== id))
    }
    document.addEventListener("delete-node", handler)
    return () => document.removeEventListener("delete-node", handler)
  }, [])

  /* ---------- Flow ---------- */

  const onNodesChange = useCallback(
    (c: NodeChange[]) => setNodes((n) => applyNodeChanges(c, n)),
    []
  )

  const onEdgesChange = useCallback(
    (c: EdgeChange[]) => setEdges((e) => applyEdgeChanges(c, e)),
    []
  )

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((e) =>
        addEdge(
          {
            ...c,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          e
        )
      ),
    []
  )

  /* ---------- Drag ---------- */

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData("workflow/node")
    if (!raw) return
    const payload = JSON.parse(raw)

    setNodes((n) => [
      ...n,
      {
        id: nanoid(),
        type: "enterprise",
        position: { x: 200 + n.length * 220, y: 200 },
        data: {
          ...payload,
          config: defaultConfig(payload.kind),
          running: false,
        },
      },
    ])
  }, [])

  /* ---------- Run Workflow ---------- */

  async function runWorkflow() {
    for (const node of nodes) {
      setNodes((n) =>
        n.map((x) =>
          x.id === node.id
            ? { ...x, data: { ...x.data, running: true } }
            : x
        )
      )
      await new Promise((r) => setTimeout(r, 600))
      setNodes((n) =>
        n.map((x) =>
          x.id === node.id
            ? { ...x, data: { ...x.data, running: false } }
            : x
        )
      )
    }
  }

  /* ---------- Save / Load ---------- */

  function saveWorkflow() {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
      type: "application/json",
    })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "workflow.json"
    a.click()
  }

  function loadWorkflow(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const data = JSON.parse(reader.result as string)
      setNodes(data.nodes)
      setEdges(data.edges)
    }
    reader.readAsText(file)
  }

  /* ========================================================= */

  return (
    <div className="flex h-full bg-slate-100">
      {/* LEFT DRAWER */}
      {leftOpen && (
        <div className="w-55 bg-slate-900 text-white text-xs p-4 overflow-auto">
          {Object.entries(LEFT_DRAWER).map(([group, items]) => (
            <div key={group} className="mb-4">
              <div className="mb-1 font-semibold text-slate-300">{group}</div>
              {items.map((n) => (
                <div
                  key={n.label}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData(
                      "workflow/node",
                      JSON.stringify({ ...n, group })
                    )
                  }
                  className="cursor-grab rounded bg-slate-800 px-2 py-1.5 hover:bg-slate-700"
                >
                  {n.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* CANVAS */}
      <div
        className="flex-1 relative"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* TOP BAR */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <button
            onClick={() => setLeftOpen((v) => !v)}
            className="border bg-white px-2 py-1 text-xs"
          >
            ☰
          </button>
        </div>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          <button
            onClick={runWorkflow}
            className="rounded bg-green-600 px-4 py-1 text-xs text-black"
          >
            ▶ Run Workflow
          </button>
          <button onClick={saveWorkflow} className="border px-3 py-1 text-xs">
            Save
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border px-3 py-1 text-xs"
          >
            Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) =>
              e.target.files && loadWorkflow(e.target.files[0])
            }
          />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setRightOpen((v) => !v)}
            className="border bg-white px-2 py-1 text-xs"
          >
            ☰
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* RIGHT DRAWER */}
      {rightOpen && (
        <div className="w-55 bg-slate-900 text-white text-xs p-4 overflow-auto">
          {Object.entries(RIGHT_DRAWER).map(([group, items]) => (
            <div key={group} className="mb-4">
              <div className="mb-1 font-semibold text-slate-300">{group}</div>
              {items.map((n) => (
                <div
                  key={n.label}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData(
                      "workflow/node",
                      JSON.stringify({ ...n, group })
                    )
                  }
                  className="cursor-grab rounded bg-slate-800 px-2 py-1.5 hover:bg-slate-700"
                >
                  {n.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
