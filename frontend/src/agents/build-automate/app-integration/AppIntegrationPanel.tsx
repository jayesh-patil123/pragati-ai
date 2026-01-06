import * as React from "react"
import { BuildContext } from "../build-context"

export default function AppIntegrationPanel() {
  const ctx = React.useContext(BuildContext)
  if (!ctx) return <div className="text-sm text-red-600">Build context missing</div>

  const lastEndpoint = ctx.apiEndpoints?.slice(-1)[0]

  return (
    <div className="space-y-3 text-sm">
      <p className="font-semibold text-slate-900">App Integration Workspace</p>
      <p className="text-slate-600">Embed agents into your applications using widgets, SDKs, or APIs. Preview connects to your deployed endpoint.</p>

      <div className="rounded-xl border p-3 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs">Live Demo</div>
            <div className="font-semibold text-sm">{ctx.appIntegration.name || "Demo App"}</div>
          </div>

          <div className="text-xs text-slate-600">
            Connected: <span className="font-semibold">{ctx.appIntegration.connected ? "Yes" : "No"}</span>
          </div>
        </div>

        <div className="mt-3 text-xs">
          {lastEndpoint ? (
            <div className="space-y-2">
              <div className="text-[11px]">Using endpoint:</div>
              <div className="border rounded px-3 py-2 text-xs bg-gray-50">{lastEndpoint.method} {lastEndpoint.path} — {lastEndpoint.deployed ? "deployed" : "not deployed"}</div>

              <div className="flex gap-2 mt-2">
                <button className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs" onClick={() => ctx.setAppIntegration({ connected: true })}>Connect to App</button>
                <button className="rounded-full border px-3 py-1 text-xs" onClick={() => ctx.setAppIntegration({ name: "Demo App", liveDemoUrl: "#", connected: true })}>Create Embed</button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">No deployed endpoints found — deploy an API first from API Integration.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-emerald-50 p-3 text-xs text-emerald-700">
        Tip: use the embed snippet returned by your backend or SDK. This preview simulates real-time calls using your pipeline.
      </div>
    </div>
  )
}
