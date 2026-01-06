import { useEffect, useState } from "react"

type Plan = "free" | "pro" | "enterprise"

interface Subscription {
  plan: Plan
  billingCycle: "monthly" | "yearly"
  price: string
  nextBillingDate: string
  status: "active" | "canceled" | "trial"
}

export default function SubscriptionPage() {
  // ✅ Hooks unconditionally
  const [subscription, setSubscription] =
    useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔗 READY FOR BACKEND
    // apiClient.get("/subscription").then(res => setSubscription(res.data))

    // Mock data
    setTimeout(() => {
      setSubscription({
        plan: "pro",
        billingCycle: "monthly",
        price: "₹999 / month",
        nextBillingDate: "2025-03-10",
        status: "active",
      })
      setLoading(false)
    }, 400)
  }, [])

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading subscription details...
      </p>
    )
  }

  if (!subscription) {
    return (
      <p className="text-sm text-slate-500">
        No active subscription found.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Subscription
        </h2>
        <p className="text-sm text-slate-600">
          Manage your plan and billing information.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
        <p className="text-sm text-slate-500">Current plan</p>
        <p className="text-lg font-semibold text-slate-900 capitalize">
          {subscription.plan}
        </p>
        <p className="text-sm text-slate-600">
          {subscription.price}
        </p>
      </div>

      {/* Billing details */}
      <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
        <p>
          <span className="font-medium text-slate-900">
            Billing cycle:
          </span>{" "}
          {subscription.billingCycle}
        </p>
        <p>
          <span className="font-medium text-slate-900">
            Next billing date:
          </span>{" "}
          {subscription.nextBillingDate}
        </p>
        <p>
          <span className="font-medium text-slate-900">
            Status:
          </span>{" "}
          <span className="capitalize">
            {subscription.status}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Change plan
        </button>

        <button
          type="button"
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Cancel subscription
        </button>
      </div>
    </div>
  )
}
