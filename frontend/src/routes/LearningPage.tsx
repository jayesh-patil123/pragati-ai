// frontend/src/LearningPage/LearningPage.tsx
import React, { useState } from "react"
import Dashboard from "../LearningPage/Dashboard"
import Paths from "./Paths"
import Notes from "./Notes"
import AITutor from "./AI_tutor"

type TabKey = "dashboard" | "paths" | "notes" | "aiTutor"

export default function LearningPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "paths":
        return <Paths />
      case "notes":
        return <Notes />
      case "aiTutor":
        return <AITutor />
      case "dashboard":
      default:
        return <Dashboard />
    }
  }

  const tabButtonClasses = (tab: TabKey) =>
    `
      px-5 py-2.5
      rounded-full
      text-sm font-medium
      border border-slate-300
      transition
      ${activeTab === tab ? "bg-slate-200 text-black border-slate-400 shadow-sm" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"}
    `

  return (
    <div
      className="
        h-full w-full
        flex items-center justify-center
        bg-slate-100
        px-3 md:px-6 py-4 md:py-6
      "
    >
      <div
        className="
          w-full max-w-6xl
          h-full
          bg-white
          rounded-[28px]
          border border-slate-200
          shadow-[0_0_40px_rgba(15,23,42,0.12)]
          flex flex-col
          overflow-hidden
        "
      >
        <header
          className="
            px-6 md:px-8 py-4 md:py-5
            border-b border-slate-200
            bg-slate-50
          "
        >
          <h1 className="text-lg md:text-xl font-semibold text-slate-900">
            Learning Hub
          </h1>

          <div className="mt-4 flex gap-4">
            <button
              className={tabButtonClasses("dashboard")}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={tabButtonClasses("paths")}
              onClick={() => setActiveTab("paths")}
            >
              Paths
            </button>
            <button
              className={tabButtonClasses("notes")}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
            <button
              className={tabButtonClasses("aiTutor")}
              onClick={() => setActiveTab("aiTutor")}
            >
              AI Tutor
            </button>
          </div>
        </header>

        {/* Positioned container for panels inside the white card.
            Must be `relative` and `overflow-hidden` so child absolute panels are contained. */}
        <div className="relative flex-1 overflow-hidden">
          {/* keep the existing scrolling/padding inside a child so absolute children can span the container */}
          <div className="h-full overflow-y-auto px-6 md:px-8 py-5 md:py-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
