import * as React from "react"

function CallTab() {
  return (
    <div className="rounded-xl border bg-gray-50 p-5 text-sm space-y-3">
      <header className="font-semibold text-gray-900">
        Call Routing & Voice Ops
      </header>

      <p className="text-gray-600">
        Intelligent call distribution, IVR integration, and live agent
        monitoring will be handled through this interface.
      </p>

      <div className="rounded-lg border bg-white p-4 text-xs text-gray-500">
        WebRTC / Telephony service integration placeholder.
      </div>
    </div>
  )
}

export default React.memo(CallTab)
