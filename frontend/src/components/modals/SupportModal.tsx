import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface SupportModalProps {
  open: boolean
  onClose: () => void
}

type SupportCategory =
  | "billing"
  | "technical"
  | "account"
  | "feedback"
  | "other"

export default function SupportModal({
  open,
  onClose,
}: SupportModalProps) {
  // ✅ Hooks must be unconditional
  const [category, setCategory] =
    useState<SupportCategory>("technical")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const handleSubmit = async () => {
    setError(null)

    if (!subject || !message) {
      setError("Subject and message are required.")
      return
    }

    try {
      setLoading(true)

      // 🔗 READY FOR BACKEND
      // await apiClient.post("/support/tickets", {
      //   category,
      //   subject,
      //   message,
      // })

      console.log("Submitting support ticket:", {
        category,
        subject,
        message,
      })

      onClose()
    } catch {
      setError("Failed to submit request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Support" onClose={onClose}>
      <div className="space-y-4 text-sm">
        {/* Category */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Category
          </label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value as SupportCategory
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="technical">Technical issue</option>
            <option value="billing">Billing</option>
            <option value="account">Account</option>
            <option value="feedback">Feedback</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            placeholder="Brief summary of your issue"
          />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label className="font-medium text-slate-900">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            placeholder="Describe your issue in detail"
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
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-black hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Submit request"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
