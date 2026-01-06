import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface GeneralSettingsModalProps {
  open: boolean
  onClose: () => void
}

type LanguageOption = "en" | "hi" | "fr"
type HomeScreenOption = "dashboard" | "courses" | "activity"

export default function GeneralSettingsModal({
  open,
  onClose,
}: GeneralSettingsModalProps) {
  // ✅ Hooks MUST be declared unconditionally
  const [language, setLanguage] = useState<LanguageOption>("en")
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [homeScreen, setHomeScreen] =
    useState<HomeScreenOption>("dashboard")

  // ✅ Conditional rendering AFTER hooks
  if (!open) return null

  const handleSave = () => {
    console.log("Saving General Settings:", {
      language,
      timezone,
      homeScreen,
    })
    onClose()
  }

  return (
    <ModalShell title="General Settings" onClose={onClose}>
      <div className="space-y-5 text-sm">
        {/* Language */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Language
          </label>
          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value as LanguageOption)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Time Zone
          </label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            placeholder="e.g. Asia/Kolkata"
          />
        </div>

        {/* Default Home Screen */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Default Home Screen
          </label>
          <select
            value={homeScreen}
            onChange={(e) =>
              setHomeScreen(
                e.target.value as HomeScreenOption
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="dashboard">Dashboard</option>
            <option value="courses">My Courses</option>
            <option value="activity">Recent Activity</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-black hover:bg-slate-800"
          >
            Save changes
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
