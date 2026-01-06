import { useState } from "react"
import ModalShell from "../ui/ModalShell"

interface TrustedDevicesModalProps {
  open: boolean
  onClose: () => void
}

interface TrustedDevice {
  id: string
  name: string
  location: string
  lastUsed: string
  current: boolean
}

export default function TrustedDevicesModal({
  open,
  onClose,
}: TrustedDevicesModalProps) {
  // ✅ Hooks must be unconditional
  const [devices, setDevices] = useState<TrustedDevice[]>([
    {
      id: "1",
      name: "Chrome on Windows",
      location: "Pune, India",
      lastUsed: "Today",
      current: true,
    },
    {
      id: "2",
      name: "Android Phone",
      location: "Mumbai, India",
      lastUsed: "3 days ago",
      current: false,
    },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Conditional render AFTER hooks
  if (!open) return null

  const handleRemoveDevice = async (id: string) => {
    setError(null)
    setLoading(true)

    try {
      // 🔗 READY FOR BACKEND
      // await apiClient.delete(`/security/trusted-devices/${id}`)

      setDevices((prev) =>
        prev.filter((device) => device.id !== id)
      )
    } catch {
      setError("Failed to remove device. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAll = async () => {
    setError(null)
    setLoading(true)

    try {
      // 🔗 READY FOR BACKEND
      // await apiClient.post("/security/trusted-devices/clear")

      setDevices((prev) =>
        prev.filter((device) => device.current)
      )
    } catch {
      setError("Failed to remove devices. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell title="Trusted Devices" onClose={onClose}>
      <div className="space-y-4 text-sm">
        {devices.length === 0 ? (
          <p className="text-slate-500">
            No trusted devices found.
          </p>
        ) : (
          <ul className="space-y-3">
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {device.name}
                    {device.current && (
                      <span className="ml-2 text-xs text-green-600">
                        (This device)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {device.location} · Last used{" "}
                    {device.lastUsed}
                  </p>
                </div>

                {!device.current && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleRemoveDevice(device.id)
                    }
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-60"
          >
            Close
          </button>

          {devices.some((d) => !d.current) && (
            <button
              type="button"
              onClick={handleRemoveAll}
              disabled={loading}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
            >
              Remove all other devices
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
