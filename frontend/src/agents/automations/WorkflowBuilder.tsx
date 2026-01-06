import * as React from "react"
import {
  Zap,
  Workflow,
  Filter,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

export default function WorkflowBuilder(): React.JSX.Element {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Visual builder
          </p>
          <p className="text-sm font-semibold text-slate-900">
            Define trigger, conditions and actions
          </p>
        </div>
      </div>

      {/* Steps bar */}
      <div className="flex items-center gap-2 text-[11px]">
        <StepPill label="Trigger" active />
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <StepPill label="Conditions" />
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <StepPill label="Actions" />
      </div>

      {/* Canvas */}
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 space-y-3">
        {/* Trigger node */}
        <div className="flex items-start gap-2">
          <NodeConnector />
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-[11px] font-semibold text-slate-900">
                  Trigger
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                Event-based
              </span>
            </div>
            <p className="text-[11px] text-slate-700">
              When a new support ticket is created with priority{" "}
              <span className="font-semibold">High</span>.
            </p>
          </div>
        </div>

        {/* Condition node */}
        <div className="flex items-start gap-2">
          <NodeConnector />
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-sky-600" />
                <p className="text-[11px] font-semibold text-slate-900">
                  Conditions
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-100">
                Optional
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              <li>• Ticket is not assigned to an owner.</li>
              <li>• Customer is in &quot;Premium&quot; segment.</li>
            </ul>
          </div>
        </div>

        {/* Actions node */}
        <div className="flex items-start gap-2">
          <NodeConnector isLast />
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <Workflow className="h-3.5 w-3.5 text-violet-600" />
                <p className="text-[11px] font-semibold text-slate-900">
                  Actions
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 border border-violet-100">
                3 steps
              </span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-700">
              <li>1. Assign ticket to &quot;Premium support&quot; queue.</li>
              <li>2. Post context summary to #support-high-priority.</li>
              <li>3. Notify account owner via email.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Changes are saved to this draft only. You can turn it on once tested.
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white text-[11px] font-medium px-3 py-1.5 hover:bg-slate-50"
          >
            Test run
          </button>
          <button
            type="button"
            className="rounded-full bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 hover:bg-black"
          >
            Save & activate
          </button>
        </div>
      </div>
    </div>
  )
}

function StepPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 border text-[11px] ${
        active
          ? "border-slate-900 bg-slate-900 text-slate-50"
          : "border-slate-300 bg-slate-50 text-slate-600"
      }`}
    >
      {label}
    </span>
  )
}

function NodeConnector({ isLast }: { isLast?: boolean }) {
  return (
    <div className="flex flex-col items-center mr-1">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      {!isLast && (
        <span className="mt-0.5 h-10 w-px bg-slate-300 rounded-full" />
      )}
    </div>
  )
}
