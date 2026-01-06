import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface UpdateEmailModalProps {
  open: boolean
  onClose: () => void
}

type Step = "enter" | "verify"

export function UpdateEmailModal({
  open,
  onClose,
}: UpdateEmailModalProps) {
  // ✅ Hooks must be unconditional
  const [step, setStep] = useState<Step>("enter")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleRequestVerification = async () => {
    setError(null)

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    try {
      setLoading(true)

      // 🔗 READY FOR BACKEND
      // await apiClient.post("/account/email/request-change", { email })

      console.log("Requesting email change:", email)
      setStep("verify")
    } catch {
      setError("Failed to send verification code.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndUpdate = async () => {
    setError(null)

    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code.")
      return
    }

    try {
      setLoading(true)

      // 🔗 READY FOR BACKEND
      // await apiClient.post("/account/email/verify", { email, otp })

      console.log("Email updated:", { email, otp })
      onClose()
    } catch {
      setError("Invalid or expired verification code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Update Email" onClose={onClose}>
      <div className="space-y-4 text-sm">
        {/* STEP 1: Enter new email */}
        {step === "enter" && (
          <>
            <p className="text-slate-600">
              Enter your new email address. We will send a
              verification code to confirm the change.
            </p>

            <div className="space-y-1">
              <label className="font-medium text-slate-900">
                New email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

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
                onClick={handleRequestVerification}
                disabled={loading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send code"}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Verify code */}
        {step === "verify" && (
          <>
            <p className="text-slate-600">
              Enter the 6-digit verification code sent to{" "}
              <span className="font-medium">{email}</span>.
            </p>

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              className="w-full text-center tracking-widest rounded-lg border border-slate-300 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              placeholder="123456"
            />

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("enter")}
                disabled={loading}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleVerifyAndUpdate}
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-black hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Confirm update"}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  )
}
