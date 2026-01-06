import * as React from "react"
import { BuildContext } from "../build-context"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"

type ApiEndpoint = {
  id: string
  path: string
  method: HttpMethod
  mappedFrom?: string
  deployed?: boolean
}

type WorkflowNode = {
  id: string
  label?: string
}

export default function APIIntegrationPanel() {
  const ctx = React.useContext(BuildContext)

  // Hooks must be declared unconditionally
  const [path, setPath] = React.useState<string>("/predict")
  const [method, setMethod] = React.useState<HttpMethod>("POST")
  const [mappedFrom, setMappedFrom] = React.useState<string | undefined>(undefined)

  // now it's safe to early-return the UI if ctx is missing
  if (!ctx) return <div className="text-sm text-red-600">Build context missing</div>

  const addEndpoint = () => {
    const id = `ep-${Date.now()}`
    const ep: ApiEndpoint = { id, path, method, mappedFrom, deployed: false }
    ctx.setApiEndpoints([...(ctx.apiEndpoints || []), ep])
    setPath("/predict")
    setMethod("POST")
    setMappedFrom(undefined)
  }

  const deployEndpoint = (id: string) => {
    const eps: ApiEndpoint[] = (ctx.apiEndpoints || []).map((e) =>
      e.id === id ? { ...e, deployed: true } : e
    )
    ctx.setApiEndpoints(eps)
  }

  const workflowNodes = (ctx.workflow?.nodes as WorkflowNode[] | undefined) || []
  const availableMappings = [
    { id: "dataset-latest", label: "Dataset: latest version" },
    ...workflowNodes.map((n) => ({ id: n.id, label: `Node: ${n.label ?? n.id}` })),
  ]

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-700">Create API Endpoint</p>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="rounded border px-2 py-1 text-xs"
          />

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="rounded border px-2 py-1 text-xs"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            value={mappedFrom ?? ""}
            onChange={(e) => setMappedFrom(e.target.value || undefined)}
            className="rounded border px-2 py-1 text-xs"
          >
            <option value="">-- Map output from --</option>
            {availableMappings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              className="rounded-full bg-black text-white px-4 py-1 text-xs"
              onClick={addEndpoint}
            >
              Add Endpoint
            </button>
            <button
              className="rounded-full border px-4 py-1 text-xs"
              onClick={() => ctx.openPanel?.("app-integration")}
            >
              Next: App Integration
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-700">Existing Endpoints</p>
        {(ctx.apiEndpoints || []).length === 0 ? (
          <p className="text-xs text-slate-500">No endpoints yet.</p>
        ) : (
          <div className="space-y-2">
            {(ctx.apiEndpoints || []).map((e: ApiEndpoint) => (
              <div
                key={e.id}
                className="flex items-center justify-between border rounded px-3 py-2 text-xs bg-gray-50"
              >
                <div>
                  <div className="font-semibold">
                    {e.method} {e.path}
                  </div>
                  <div className="text-[11px] text-slate-600">Mapped: {e.mappedFrom ?? "—"}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 border rounded text-xs"
                    onClick={() => deployEndpoint(e.id)}
                  >
                    {e.deployed ? "Redeploy" : "Deploy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-emerald-50 p-3 text-xs text-emerald-700">
        When you deploy an endpoint, you can embed it into your app or open a live demo in App
        Integration.
      </div>
    </div>
  )
}
