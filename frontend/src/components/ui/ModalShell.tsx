import { X } from "lucide-react"
import React from "react"

interface ModalShellProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function ModalShell({
  title,
  onClose,
  children,
}: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40"
      onClick={onClose} // ✅ backdrop click closes modal
    >
      <div
        className="
          w-full max-w-lg
          bg-white
          rounded-2xl
          shadow-xl
          p-5
        "
        onClick={(e) => e.stopPropagation()} // ✅ prevent backdrop close
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose} // ✅ close button works
            className="p-1 rounded hover:bg-slate-100"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  )
}
