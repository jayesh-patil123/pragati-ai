import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export function EditProfileModal({
  open,
  onClose,
}: EditProfileModalProps) {
  // ✅ Hooks must be unconditional
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const handleSave = async () => {
    setError(null)

    if (!fullName || !username) {
      setError("Full name and username are required.")
      return
    }

    try {
      setLoading(true)

      // 🔗 READY FOR BACKEND
      // await apiClient.put("/account/profile", {
      //   fullName,
      //   username,
      //   bio,
      // })

      console.log("Saving profile:", {
        fullName,
        username,
        bio,
      })

      onClose()
    } catch {
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Edit Profile" onClose={onClose}>
      <div className="space-y-4 text-sm">
        {/* Full name */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            placeholder="Your full name"
          />
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            placeholder="username"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            placeholder="Tell us a little about yourself"
          />
        </div>

        {/* Error */}
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
            disabled={loading}
            className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-black hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
