import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface ActiveSessionsModalProps {
  open: boolean
  onClose: () => void
}

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

export default function ActiveSessionsModal({
  open,
  onClose,
}: ActiveSessionsModalProps) {
  // ✅ Hooks MUST be unconditional
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "Pune, India",
      lastActive: "Active now",
      current: true,
    },
    {
      id: "2",
      device: "Android App",
      location: "Mumbai, India",
      lastActive: "2 hours ago",
      current: false,
    },
  ])

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const handleSignOutSession = (id: string) => {
    // 🔗 READY FOR BACKEND:
    // await apiClient.delete(`/sessions/${id}`)

    setSessions((prev) =>
      prev.filter((session) => session.id !== id)
    )
  }

  const handleSignOutAll = () => {
    // 🔗 READY FOR BACKEND:
    // await apiClient.post("/sessions/logout-all")

    setSessions((prev) =>
      prev.filter((session) => session.current)
    )
  }

  return (
    <ModalShell title="Active Sessions" onClose={onClose}>
      <div className="space-y-4 text-sm">
        {sessions.length === 0 ? (
          <p className="text-slate-500">
            No active sessions found.
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 text-xs text-green-600">
                        (This device)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {session.location} · {session.lastActive}
                  </p>
                </div>

                {!session.current && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSignOutSession(session.id)
                    }
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Sign out
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Close
          </button>

          {sessions.some((s) => !s.current) && (
            <button
              type="button"
              onClick={handleSignOutAll}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Sign out from all devices
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
