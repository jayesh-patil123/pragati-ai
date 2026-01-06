import * as React from "react"

function FeedbackTab() {
  return (
    <div className="rounded-xl border bg-gray-50 p-5 text-sm space-y-3">
      <header className="font-semibold text-gray-900">
        Customer Feedback & Analytics
      </header>

      <p className="text-gray-600">
        Aggregated CSAT, NPS, and sentiment analysis dashboards will
        appear here for support performance tracking.
      </p>

      <div className="rounded-lg border bg-white p-4 text-xs text-gray-500">
        Analytics pipeline and reporting engine integration placeholder.
      </div>
    </div>
  )
}

export default React.memo(FeedbackTab)
