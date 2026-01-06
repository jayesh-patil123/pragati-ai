import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
}

type Plan = "free" | "pro" | "enterprise"

export default function SubscriptionModal({
  open,
  onClose,
}: SubscriptionModalProps) {
  // ✅ Hooks must be unconditional
  const [currentPlan, setCurrentPlan] = useState<Plan>("free")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const handleUpgrade = async () => {
    setError(null)
    setLoading(true)

    try {
      // 🔗 READY FOR BACKEND
      // await apiClient.post("/subscription/change", {
      //   plan: currentPlan,
      //   billingCycle,
      // })

      console.log("Updating subscription:", {
        currentPlan,
        billingCycle,
      })

      onClose()
    } catch {
      setError("Failed to update subscription. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Subscription" onClose={onClose}>
      <div className="space-y-5 text-sm">
        {/* Current plan */}
        <div>
          <p className="font-medium text-slate-900">
            Current plan
          </p>
          <p className="text-slate-600 capitalize">
            {currentPlan}
          </p>
        </div>

        {/* Plan selection */}
        <div className="space-y-2">
          <p className="font-medium text-slate-900">
            Change plan
          </p>
          <select
            value={currentPlan}
            onChange={(e) =>
              setCurrentPlan(e.target.value as Plan)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        {/* Billing cycle */}
        <div className="space-y-2">
          <p className="font-medium text-slate-900">
            Billing cycle
          </p>
          <select
            value={billingCycle}
            onChange={(e) =>
              setBillingCycle(
                e.target.value as "monthly" | "yearly"
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly (save 20%)</option>
          </select>
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
            onClick={handleUpgrade}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-black hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update plan"}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
