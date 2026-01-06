/**
 * AgentsPage.tsx
 *
 * Frontend-only version (no backend imports).
 * - All api/* imports removed and replaced with local stubs:
 *   getAgents(), apiCreateAgent(), apiDeleteAgent()
 * - Keeps the original UI structure and panels.
 *
 * NOTE: Replace the stubs with real API calls when you wire the backend.
 */

import * as React from "react"
import {
  Plus,
  Settings2,
  MessageSquare,
  Search,
  Globe2,
  Database,
  Workflow,
  PlugZap,
  AppWindow,
  GraduationCap,
  Bot,
  FilePlus2,
} from "lucide-react"

// Feature panels (these are UI components inside your frontend)
import CustomerSupportPanel from "../agents/your-agents/customer-support/CustomerSupportPanel"
import AnalyzerPanel from "../agents/your-agents/analyzer/AnalyzerPanel"
import ResearcherPanel from "../agents/your-agents/researcher/ResearcherPanel"
import ScraperPanel from "../agents/your-agents/scraper/ScraperPanel"
import CreateAgentPanel, { type Agent as AgentType } from "../agents/your-agents/CreateAgentPanel"

// Build & Automate panels
import AddDataPanel from "../agents/build-automate/add-data/AddDataPanel"
import WorkflowAutomationsPanel from "../agents/build-automate/workflow-automations/WorkflowAutomationsPanel"
import APIIntegrationPanel from "../agents/build-automate/api-integration/APIIntegrationPanel"
import AppIntegrationPanel from "../agents/build-automate/app-integration/AppIntegrationPanel"

// Templates
import ResearchTemplatePanel from "../agents/templates/research/ResearchTemplatePanel"
import EmailAutomationPanel from "../agents/templates/email-automation/EmailAutomationPanel"
import SkillsToolsPanel from "../agents/templates/skills-tools/SkillsToolsPanel"
import CodingAssistantPanel from "../agents/templates/coding-assistant/CodingAssistantPanel"

// Knowledge & training
import TraineeAgentPanel from "../agents/knowledge-training/trainee-agent/TraineeAgentPanel"
import ChatbotPanel from "../agents/knowledge-training/chatbot/ChatbotPanel"
import KnowledgeBasePanel from "../agents/knowledge-training/knowledge-base/KnowledgeBasePanel"
import LearningSandboxPanel from "../agents/knowledge-training/learning-sandbox/LearningSandboxPanel"

// Build context
import AutomationsPanel from "../agents/automations/AutomationsPanel"
import { BuildContext } from "../agents/build-automate/build-context"
import type {
  DatasetInfo,
  DatasetVersion,
  WorkflowInfo,
  WorkflowNode,
  WorkflowEdge,
  APIEndpoint,
  AppIntegrationInfo,
  BuildContextValue,
} from "../agents/build-automate/build-context"

/* -----------------------------------------------------------
   Local frontend-only API stubs (no backend)
   - getAgents(): Promise<AgentType[]>
   - apiCreateAgent(payload): Promise<AgentType>
   - apiDeleteAgent(id): Promise<{ ok: boolean }>
   ---------------------------------------------------------*/

/**
 * NOTE:
 * The real Agent type is imported from CreateAgentPanel. If that import fails,
 * TypeScript will show a missing type error — adjust imports as needed.
 */

// A minimal generator for stub agent IDs
const makeId = (prefix = "agent") => `${prefix}-${Math.floor(Math.random() * 1e9).toString(36)}`

async function getAgents(): Promise<AgentType[]> {
  // Return empty list — prevents runtime errors and lets default cards render
  return []
}

async function apiCreateAgent(payload: AgentType): Promise<AgentType> {
  // Create a client-side stub agent (no network). Ensure required fields exist.
  const now = new Date().toISOString()
  const id = payload?.id ?? makeId()
  return {
    ...payload,
    id,
    createdAt: payload?.createdAt ?? now,
  } as AgentType
}

async function apiDeleteAgent(_id: string): Promise<{ ok: boolean }> {
  // Pretend deletion succeeded.
  return { ok: true }
}

/* ---------------- UI helpers ---------------- */

interface DetailItem {
  id: string
  title: string
  category: string
}

function SimpleCard({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  onClick,
  onDelete,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  actionLabel?: string
  onClick?: () => void
  onDelete?: (e?: React.MouseEvent) => void
}) {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer"
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(e)
          }}
          aria-label="Delete"
          className="absolute top-2 right-2 text-xs text-red-600 border px-2 py-0.5 rounded hover:bg-red-50"
          title="Delete"
        >
          Delete
        </button>
      )}

      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="pr-8">
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
        </div>
      </div>

      {actionLabel && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
          className="mt-3 self-start px-3 py-1.5 text-xs border rounded-full"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* ---------------- Main Component ---------------- */

export default function AgentsPage(): React.JSX.Element {
  const [selectedItem, setSelectedItem] = React.useState<DetailItem | null>(null)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false)
  const [isWorkspaceMode, setIsWorkspaceMode] = React.useState(false)

  // Build/workspace state (typed)
  const [dataset, setDatasetState] = React.useState<DatasetInfo>({
    name: "",
    type: undefined,
    versions: [] as DatasetVersion[],
  })

  const [workflow, setWorkflowState] = React.useState<WorkflowInfo>({
    engine: "react-flow" as WorkflowInfo["engine"],
    trigger: "manual" as WorkflowInfo["trigger"],
    nodes: [] as WorkflowNode[],
    edges: [] as WorkflowEdge[],
    deployed: false,
  })

  const [apiEndpoints, setApiEndpoints] = React.useState<APIEndpoint[]>([])
  const [appIntegration, setAppIntegrationState] = React.useState<AppIntegrationInfo>({
    name: "",
    connected: false,
  })

  // Agents state
  const [agents, setAgents] = React.useState<AgentType[]>([])

  // Load initial data (stubs)
  React.useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        const [agentsData, datasetData, workflowData] = await Promise.all([
          getAgents(),
          // the following calls are real imports in your original; keep them if you have them:
          // getDataset(), getWorkflow()
          // but to stay backend-free we use simple stubs for dataset/workflow shape:
          Promise.resolve({ name: "", type: undefined, versions: [] as DatasetVersion[] }),
          Promise.resolve({
            engine: "react-flow",
            trigger: "manual",
            nodes: [] as WorkflowNode[],
            edges: [] as WorkflowEdge[],
            deployed: false,
          } as unknown as WorkflowInfo),
        ])

        if (!mounted) return

        setAgents(agentsData || [])
        setDatasetState({
          name: datasetData.name,
          type: datasetData.type as DatasetInfo["type"],
          versions: datasetData.versions as DatasetVersion[],
        })
        setWorkflowState({
          ...workflowData,
          engine: workflowData.engine as WorkflowInfo["engine"],
          nodes: workflowData.nodes as WorkflowNode[],
          edges: workflowData.edges as WorkflowEdge[],
        })

        // api endpoints stub
        setApiEndpoints([])
      } catch (err) {
        // swallow errors for stubbed mode
        console.error("loadData (stub) error:", err)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [])

  // addAgent / removeAgent (use stable callbacks)
  const addAgent = React.useCallback(async (agent: AgentType) => {
    const saved = await apiCreateAgent(agent)
    setAgents((prev) => [saved, ...prev])
  }, [])

  const removeAgent = React.useCallback(async (id: string) => {
    await apiDeleteAgent(id)
    setAgents((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // scroll slider ref
  const mainGridRef = React.useRef<HTMLDivElement | null>(null)
  const [sliderValue, setSliderValue] = React.useState<number>(0)

  const openItem = React.useCallback((item: DetailItem, openWorkspace = true) => {
    setSelectedItem(item)
    if (openWorkspace) setIsWorkspaceOpen(true)
    setIsWorkspaceMode(false)
  }, [])

  const openPanelById = React.useCallback((id: string, openWorkspace = true) => {
    const map: Record<string, DetailItem> = {
      "create-agent": { id: "create-agent", title: "Create Agent", category: "Your Agent" },
      "add-data": { id: "add-data", title: "Add Data", category: "Build & Automate" },
      "workflow-automations": { id: "workflow-automations", title: "Workflow Automations", category: "Build & Automate" },
      "api-integration": { id: "api-integration", title: "API Integration", category: "Build & Automate" },
      "app-integration": { id: "app-integration", title: "App Integration", category: "Build & Automate" },
      "automations": { id: "automations", title: "Automations", category: "Control Center" },
    }
    const it = map[id]
    if (it) {
      setSelectedItem(it)
      if (openWorkspace) setIsWorkspaceOpen(true)
    }
  }, [])

  const backToChooser = React.useCallback(() => {
    setSelectedItem(null)
  }, [])

  const closeWorkspace = React.useCallback(() => {
    setIsWorkspaceOpen(false)
    setIsWorkspaceMode(false)
    setTimeout(() => setSelectedItem(null), 200)
  }, [])

  const onSliderChange = React.useCallback((val: number) => {
    setSliderValue(val)
    const el = mainGridRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTop = Math.round((val / 100) * (max > 0 ? max : 0))
  }, [])

  React.useEffect(() => {
    const el = mainGridRef.current
    if (!el) return
    function onScroll() {
      const refEl = mainGridRef.current
      if (!refEl) return
      const max = refEl.scrollHeight - refEl.clientHeight
      const v = max > 0 ? Math.round((refEl.scrollTop / max) * 100) : 0
      setSliderValue(v)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // BuildContext value (typed)
  const buildContextValue = React.useMemo<BuildContextValue>(() => {
    return {
      dataset,
      setDataset: (d: Partial<DatasetInfo>) => setDatasetState((s) => ({ ...s, ...d })),
      addVersion: (v) => {
        // stub: push a version client-side
        const version = { ...v } as unknown as DatasetVersion
        setDatasetState((s) => ({ ...s, versions: [version, ...s.versions] }))
      },
      workflow,
      setWorkflow: (patch: Partial<WorkflowInfo>) => {
        setWorkflowState((s) => ({ ...s, ...patch }))
      },
      addNode: (node: WorkflowNode) => setWorkflowState((s) => ({ ...s, nodes: [...s.nodes, node] })),
      addEdge: (edge: WorkflowEdge) => setWorkflowState((s) => ({ ...s, edges: [...s.edges, edge] })),
      apiEndpoints,
      setApiEndpoints: (eps: APIEndpoint[]) => setApiEndpoints(eps),
      appIntegration,
      setAppIntegration: (a: Partial<AppIntegrationInfo>) => setAppIntegrationState((s) => ({ ...s, ...a })),
      openPanel: (id: string) => openPanelById(id, true),
      addAgent,
      removeAgent,
    }
  }, [dataset, workflow, apiEndpoints, appIntegration, openPanelById, addAgent, removeAgent])

  const renderDetailContent = React.useCallback(
    (item: DetailItem) => {
      if (item.id.startsWith("agent-")) {
        const found = agents.find((a) => a.id === item.id)
        if (!found) return <div className="text-slate-500">Agent not found</div>
        return (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{found.name}</h3>
                {found.description && <p className="text-sm text-slate-600 my-2">{found.description}</p>}
                <div className="text-xs text-slate-500">Type: <strong>{found.type}</strong></div>
                <div className="text-xs text-slate-500">Created: {new Date(found.createdAt).toLocaleString()}</div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const ok = confirm(`Delete agent “${found.name}”? This cannot be undone.`)
                    if (!ok) return
                    removeAgent(found.id)
                  }}
                  className="px-3 py-1 text-xs border text-red-700 rounded"
                >
                  Delete Agent
                </button>

                <button
                  onClick={() => {
                    setSelectedItem(null)
                  }}
                  className="px-3 py-1 text-xs border rounded"
                >
                  Back to list
                </button>
              </div>
            </div>
          </div>
        )
      }

      switch (item.id) {
        case "create-agent":
          return (
            <CreateAgentPanel
              onCreate={(agent) => {
                addAgent(agent)
                setSelectedItem({ id: agent.id, title: agent.name, category: "Your Agent" })
                setIsWorkspaceOpen(true)
                setIsWorkspaceMode(false)
              }}
              onClose={() => {
                setSelectedItem(null)
              }}
            />
          )

        case "customer-support-agent":
          return <CustomerSupportPanel />
        case "analyzer-agent":
          return <AnalyzerPanel />
        case "researcher-agent":
          return <ResearcherPanel />
        case "scraper-agent":
          return <ScraperPanel />

        case "add-data":
          return <AddDataPanel />
        case "workflow-automations":
          return <WorkflowAutomationsPanel />
        case "api-integration":
          return <APIIntegrationPanel />
        case "app-integration":
          return <AppIntegrationPanel />

        case "template-research":
          return <ResearchTemplatePanel />
        case "template-email":
          return <EmailAutomationPanel />
        case "template-skills":
          return <SkillsToolsPanel />
        case "template-coding":
          return <CodingAssistantPanel />

        case "trainee-agent":
          return <TraineeAgentPanel />
        case "chatbot":
          return <ChatbotPanel />
        case "knowledge-base":
          return <KnowledgeBasePanel />
        case "learning-sandbox":
          return <LearningSandboxPanel />

        case "automations":
          return <AutomationsPanel />

        default:
          return <div className="text-sm text-slate-600">Feature coming soon.</div>
      }
    },
    [agents, addAgent, removeAgent]
  )

  // close overlay on ESC
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeWorkspace()
    }
    if (isWorkspaceOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isWorkspaceOpen, closeWorkspace])

  return (
    <BuildContext.Provider value={buildContextValue}>
      <div className="min-h-screen bg-slate-100 flex justify-center p-6">
        <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6">
            <header className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-semibold">AI Agents</h1>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    setSelectedItem({ id: "create-agent", title: "Create Agent", category: "Your Agent" })
                    setIsWorkspaceOpen(true)
                    setIsWorkspaceMode(false)
                  }}
                  className="bg-black text-grey px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Create Agent
                </button>

                <button
                  onClick={() => {
                    setIsWorkspaceMode(true)
                    setSelectedItem(null)
                    setIsWorkspaceOpen(true)
                  }}
                  className="border px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <AppWindow className="h-4 w-4" />
                  Workspace
                </button>

                <button
                  onClick={() => {
                    openPanelById("automations", true)
                    setIsWorkspaceMode(false)
                  }}
                  className="border px-4 py-2 rounded-full flex items-center gap-2"
                >
                  <Settings2 className="h-4 w-4 inline" /> Automations
                </button>
              </div>
            </header>

            <div className="relative">
              <div
                ref={mainGridRef}
                className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-220px)] overflow-y-auto pr-6 pl-0"
              >
                <section>
                  <h2 className="font-semibold mb-3">Your Agents</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {agents.map((a) => (
                      <SimpleCard
                        key={a.id}
                        title={a.name}
                        subtitle={a.description}
                        actionLabel="Open"
                        onClick={() => openItem({ id: a.id, title: a.name, category: "Your Agent" }, true)}
                        onDelete={() => {
                          const ok = confirm(`Delete agent "${a.name}"?`)
                          if (!ok) return
                          removeAgent(a.id)
                        }}
                      />
                    ))}

                    <SimpleCard title="Customer Support" icon={MessageSquare} actionLabel="Open" onClick={() => openItem({ id: "customer-support-agent", title: "Customer Support", category: "Your Agent" }, true)} />
                    <SimpleCard title="Analyzer" icon={Search} actionLabel="Open" onClick={() => openItem({ id: "analyzer-agent", title: "Analyzer", category: "Your Agent" }, true)} />
                    <SimpleCard title="Researcher" icon={Bot} actionLabel="Open" onClick={() => openItem({ id: "researcher-agent", title: "Researcher", category: "Your Agent" }, true)} />
                    <SimpleCard title="Scraper" icon={Globe2} actionLabel="Open" onClick={() => openItem({ id: "scraper-agent", title: "Scraper", category: "Your Agent" }, true)} />
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold mb-3">Build & Automate</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <SimpleCard title="Add Data" icon={Database} onClick={() => openItem({ id: "add-data", title: "Add Data", category: "Build & Automate" }, true)} />
                    <SimpleCard title="Workflow Automations" icon={Workflow} onClick={() => openItem({ id: "workflow-automations", title: "Workflow Automations", category: "Build & Automate" }, true)} />
                    <SimpleCard title="API Integration" icon={PlugZap} onClick={() => openItem({ id: "api-integration", title: "API Integration", category: "Build & Automate" }, true)} />
                    <SimpleCard title="App Integration" icon={AppWindow} onClick={() => openItem({ id: "app-integration", title: "App Integration", category: "Build & Automate" }, true)} />
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold mb-3">Agent Templates</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <SimpleCard title="Research Agent" icon={Search} onClick={() => openItem({ id: "template-research", title: "Research Agent", category: "Template" }, true)} />
                    <SimpleCard title="Email Automation" icon={MessageSquare} onClick={() => openItem({ id: "template-email", title: "Email Automation", category: "Template" }, true)} />
                    <SimpleCard title="Skills & Tools" icon={Settings2} onClick={() => openItem({ id: "template-skills", title: "Skills & Tools", category: "Template" }, true)} />
                    <SimpleCard title="Coding Assistant" icon={Bot} onClick={() => openItem({ id: "template-coding", title: "Coding Assistant", category: "Template" }, true)} />
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold mb-3">Knowledge & Training</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <SimpleCard title="Trainee Agent" icon={GraduationCap} onClick={() => openItem({ id: "trainee-agent", title: "Trainee Agent", category: "Knowledge & Training" }, true)} />
                    <SimpleCard title="Chatbot" icon={Bot} onClick={() => openItem({ id: "chatbot", title: "Chatbot", category: "Knowledge & Training" }, true)} />
                    <SimpleCard title="Knowledge Base" icon={FilePlus2} onClick={() => openItem({ id: "knowledge-base", title: "Knowledge Base", category: "Knowledge & Training" }, true)} />
                    <SimpleCard title="Learning Sandbox" icon={Bot} onClick={() => openItem({ id: "learning-sandbox", title: "Learning Sandbox", category: "Knowledge & Training" }, true)} />
                  </div>
                </section>
              </div>

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-40">
                <input
                  aria-label="Scroll slider"
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={(e) => onSliderChange(Number(e.target.value))}
                  className="h-36 w-2 rotate-90 -translate-x-1/2 appearance-none"
                  style={{
                    transform: "rotate(-90deg)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* slide-in panel/backdrop */}
          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
              isWorkspaceOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
            aria-hidden={!isWorkspaceOpen}
          >
            <div onClick={closeWorkspace} className="absolute inset-0 bg-black/20 rounded-3xl" />
          </div>

          <aside
            className={`absolute inset-0 z-50 transform transition-transform duration-300 ease-out ${
              isWorkspaceOpen ? "translate-x-0" : "translate-x-full"
            }`}
            role="dialog"
            aria-hidden={!isWorkspaceOpen}
          >
            <div className="h-full bg-white shadow-xl rounded-3xl overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center">
                    <AppWindow className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-500">{selectedItem?.category ?? "Workspace"}</p>
                    <h2 className="text-xl font-semibold">{selectedItem?.title ?? "Workspace"}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isWorkspaceMode && selectedItem && <button onClick={backToChooser} className="px-3 py-1 text-sm border rounded">Back</button>}
                  <button onClick={closeWorkspace} className="px-3 py-1 text-sm border rounded">Close</button>
                </div>
              </div>

              <div className="h-[calc(100%-64px)] overflow-auto p-0">
                {selectedItem ? renderDetailContent(selectedItem) : (
                  <div className="flex flex-col gap-4 items-start">
                    <p className="text-slate-600">Open a tool:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => openPanelById("add-data", true)} className="px-4 py-2 border rounded">Add Data</button>
                      <button onClick={() => openPanelById("workflow-automations", true)} className="px-4 py-2 border rounded">Workflow</button>
                      <button onClick={() => openPanelById("api-integration", true)} className="px-4 py-2 border rounded">API Integration</button>
                      <button onClick={() => openPanelById("app-integration", true)} className="px-4 py-2 border rounded">App Integration</button>
                      <button onClick={() => openPanelById("automations", true)} className="px-4 py-2 border rounded">Automations</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </BuildContext.Provider>
  )
}
