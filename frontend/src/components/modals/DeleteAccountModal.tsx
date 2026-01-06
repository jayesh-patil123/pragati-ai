import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface DeleteAccountModalProps {
  open: boolean
  onClose: () => void
}

export function DeleteAccountModal({
  open,
  onClose,
}: DeleteAccountModalProps) {
  // ✅ Hooks must be unconditional
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const isConfirmed = confirmation === "DELETE"

  const handleDelete = async () => {
    if (!isConfirmed) return

    setError(null)
    setLoading(true)

    try {
      // 🔗 READY FOR BACKEND
      // await apiClient.delete("/account")

      console.log("Account deleted")

      // After successful deletion you would usually:
      // 1. Clear auth state
      // 2. Redirect to goodbye / login page
      onClose()
    } catch {
      setError("Failed to delete account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Delete Account" onClose={onClose}>
      <div className="space-y-5 text-sm">
        {/* Warning */}
        <p className="text-red-600 font-medium">
          This action is permanent and cannot be undone.
        </p>

        <p className="text-slate-600">
          All your data, sessions, and preferences will be
          permanently removed.
        </p>

        {/* Confirmation input */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Type <span className="font-semibold">DELETE</span> to
            confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600/30"
            placeholder="DELETE"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="
              rounded-lg
              bg-red-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              hover:bg-red-700
              disabled:opacity-50
            "
          >
            {loading ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
