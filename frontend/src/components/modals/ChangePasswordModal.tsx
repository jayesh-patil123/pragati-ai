import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  // ✅ Hooks must be unconditional
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const handleSubmit = async () => {
    setError(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.")
      return
    }

    try {
      setLoading(true)

      // 🔗 READY FOR BACKEND
      // await apiClient.post("/auth/change-password", {
      //   currentPassword,
      //   newPassword,
      // })

      console.log("Changing password:", {
        currentPassword,
        newPassword,
      })

      onClose()
    } catch {
      setError("Failed to change password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Change Password" onClose={onClose}>
      <div className="space-y-4 text-sm">
        {/* Current password */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>

        {/* New password */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>

        {/* Confirm password */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-600 hover:text-slate-900"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-black hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update password"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
