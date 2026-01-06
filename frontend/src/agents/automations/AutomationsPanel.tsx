import * as React from "react"
import {
  Workflow,
  Zap,
  Clock,
  PlayCircle,
  PauseCircle,
  CalendarClock,
  Plus,
} from "lucide-react"
import WorkflowBuilder from "./WorkflowBuilder"

type AutomationStatus = "active" | "paused"

interface AutomationItem {
  id: string
  name: string
  status: AutomationStatus
  type: "event" | "schedule" | "manual"
  lastRun: string
  runsToday: number
  triggerSummary: string
}

const MOCK_AUTOMATIONS: AutomationItem[] = [
  {
    id: "auto-1",
    name: "New lead → Welcome email + assign owner",
    status: "active",
    type: "event",
    lastRun: "2 min ago",
    runsToday: 34,
    triggerSummary: "When a new Lead is created in CRM",
  },
  {
    id: "auto-2",
    name: "Support ticket idle 24h → Escalate",
    status: "active",
    type: "schedule",
    lastRun: "29 min ago",
    runsToday: 12,
    triggerSummary: "Every 30 min, find tickets with no reply for 24h",
  },
  {
    id: "auto-3",
    name: "Weekly account health report",
    status: "paused",
    type: "schedule",
    lastRun: "2 days ago",
    runsToday: 0,
    triggerSummary: "Every Monday at 9:00 AM",
  },
]

export default function AutomationsPanel(): React.JSX.Element {
  const [automations] = React.useState<AutomationItem[]>(MOCK_AUTOMATIONS)
  const [selectedAutomation, setSelectedAutomation] =
    React.useState<AutomationItem | null>(automations[0] ?? null)
  const [showBuilder, setShowBuilder] = React.useState(false)

  const activeCount = automations.filter((a) => a.status === "active").length

  return (
    <div className="space-y-4 text-sm">
      {/* Intro / summary */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Control Center
        </p>
        <p className="text-sm text-slate-700">
          Orchestrate how your agents react to events, schedules and external
          tools. Use automations to connect AI to real work.
        </p>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Active automations</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Runs today</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {automations.reduce((sum, a) => sum + a.runsToday, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] text-slate-500">Most common type</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {resolveMostCommonType(automations)}
            </p>
          </div>
        </div>
      </div>

      {/* Main layout: list + detail/builder */}
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.8fr)]">
        {/* Left: Automation list */}
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Workflow className="h-3.5 w-3.5 text-slate-700" />
              <p className="text-xs font-semibold text-slate-900">
                Automations
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedAutomation(null)
                setShowBuilder(true)
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3 w-3" />
              New automation
            </button>
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {automations.map((automation) => {
              const isActive = automation.id === selectedAutomation?.id
              return (
                <button
                  key={automation.id}
                  type="button"
                  onClick={() => {
                    setSelectedAutomation(automation)
                    setShowBuilder(false)
                  }}
                  className={`w-full text-left rounded-xl border px-2.5 py-2 transition ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-slate-50"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold line-clamp-1">
                      {automation.name}
                    </p>
                    <StatusPill status={automation.status} />
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] line-clamp-1 ${
                      isActive
                        ? "text-slate-100/80"
                        : "text-slate-500"
                    }`}
                  >
                    {automation.triggerSummary}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span
                      className={
                        isActive
                          ? "inline-flex items-center gap-1 text-slate-100/80"
                          : "inline-flex items-center gap-1 text-slate-500"
                      }
                    >
                      <Clock className="h-3 w-3" />
                      Last run {automation.lastRun}
                    </span>
                    <span
                      className={
                        isActive
                          ? "inline-flex items-center gap-1 text-emerald-100"
                          : "inline-flex items-center gap-1 text-emerald-600"
                      }
                    >
                      <Zap className="h-3 w-3" />
                      {automation.runsToday} today
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Detail panel or workflow builder */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          {showBuilder ? (
            <WorkflowBuilder />
          ) : selectedAutomation ? (
            <AutomationDetail automation={selectedAutomation} />
          ) : (
            <EmptyState onCreate={() => setShowBuilder(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

function resolveMostCommonType(automations: AutomationItem[]): string {
  if (automations.length === 0) return "—"
  const counts: Record<AutomationItem["type"], number> = {
    event: 0,
    schedule: 0,
    manual: 0,
  }
  for (const a of automations) {
    counts[a.type] += 1
  }
  const entries = Object.entries(counts) as [AutomationItem["type"], number][]
  const [maxType] = entries.reduce((max, curr) =>
    curr[1] > max[1] ? curr : max,
  )
  switch (maxType) {
    case "event":
      return "Event-based"
    case "schedule":
      return "Scheduled"
    case "manual":
      return "Manual"
    default:
      return "—"
  }
}

function StatusPill({ status }: { status: AutomationStatus }) {
  const isActive = status === "active"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
        isActive
          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-slate-100 text-slate-600"
      }`}
    >
      {isActive ? (
        <PlayCircle className="h-3 w-3" />
      ) : (
        <PauseCircle className="h-3 w-3" />
      )}
      {isActive ? "Active" : "Paused"}
    </span>
  )
}

function AutomationDetail({ automation }: { automation: AutomationItem }) {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Automation detail
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {automation.name}
          </p>
        </div>
        <StatusPill status={automation.status} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-[11px] font-semibold text-slate-900 mb-1">
          Trigger
        </p>
        <p className="text-[11px] text-slate-700">
          {automation.triggerSummary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] text-slate-500">Last run</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {automation.lastRun}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] text-slate-500">Runs today</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {automation.runsToday}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 px-3 py-2 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-slate-600" />
        <p className="text-[11px] text-slate-700">
          Add extra conditions, approvals, or follow-up actions in the workflow
          builder.
        </p>
      </div>

      <button
        type="button"
        className="w-full rounded-full bg-slate-900 text-white text-xs font-semibold px-3 py-2 hover:bg-black"
      >
        Open in workflow builder
      </button>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center gap-3 py-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
        <Workflow className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">
          No automation selected
        </p>
        <p className="text-[11px] text-slate-600 max-w-xs">
          Choose an existing automation from the list or start a new one from a
          trigger, condition and action.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="rounded-full bg-slate-900 text-white text-xs font-semibold px-4 py-2 hover:bg-black"
      >
        Create automation
      </button>
    </div>
  )
}
