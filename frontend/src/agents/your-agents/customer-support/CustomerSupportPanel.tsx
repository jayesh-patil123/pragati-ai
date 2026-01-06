import * as React from "react"
import ChatTab from "./ChatTab"
import CallTab from "./CallTab"
import FeedbackTab from "./FeedbackTab"

// Strict tab typing (no casting anywhere)
const TABS = ["chat", "call", "feedback"] as const
type Tab = (typeof TABS)[number]

// Centralized rendering map (scales effortlessly)
const TAB_COMPONENTS: Record<Tab, React.ReactNode> = {
  chat: <ChatTab />,
  call: <CallTab />,
  feedback: <FeedbackTab />,
}

export default function CustomerSupportPanel() {
  const [activeTab, setActiveTab] = React.useState<Tab>("chat")

  return (
    <section className="w-full rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">
          Customer Support Console
        </h2>
        <p className="text-xs font-medium text-emerald-600">
          Unified support across chat, voice, and feedback systems.
        </p>
      </header>

      {/* Tabs */}
      <nav
        role="tablist"
        aria-label="Customer support tabs"
        className="flex gap-2"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-medium border
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-black
                ${
                  isActive
                    ? "bg-black text-black border-black"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {tab.toUpperCase()}
            </button>
          )
        })}
      </nav>

      {/* Active Panel */}
      <div id={`panel-${activeTab}`} role="tabpanel">
        {TAB_COMPONENTS[activeTab]}
      </div>
    </section>
  )
}
