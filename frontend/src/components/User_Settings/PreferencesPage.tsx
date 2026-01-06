import { useState } from "react"

export default function PreferencesPage() {
  const [emailNotifications, setEmailNotifications] =
    useState(true)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Preferences
        </h2>
        <p className="text-sm text-slate-600">
          Control how the application behaves for you.
        </p>
      </div>

      {/* Preferences list */}
      <div className="space-y-4">
        {/* Email notifications */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
          <div>
            <p className="font-medium text-slate-900">
              Email notifications
            </p>
            <p className="text-xs text-slate-500">
              Receive updates and reminders via email.
            </p>
          </div>

          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() =>
              setEmailNotifications((v) => !v)
            }
            className="h-4 w-4"
          />
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
          <div>
            <p className="font-medium text-slate-900">
              Dark mode
            </p>
            <p className="text-xs text-slate-500">
              Reduce eye strain in low-light environments.
            </p>
          </div>

          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode((v) => !v)}
            className="h-4 w-4"
          />
        </div>
      </div>
    </div>
  )
}
