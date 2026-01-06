interface SecurityPageProps {
  onChangePassword: () => void
  onTwoFactor: () => void
  onSessions: () => void
}

export default function SecurityPage({
  onChangePassword,
  onTwoFactor,
  onSessions,
}: SecurityPageProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Security
        </h2>
        <p className="text-sm text-slate-600">
          Manage authentication and account protection.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onChangePassword}
          className="w-full rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
        >
          <p className="font-medium text-slate-900">
            Change password
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Update your account password.
          </p>
        </button>

        <button
          type="button"
          onClick={onTwoFactor}
          className="w-full rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
        >
          <p className="font-medium text-slate-900">
            Two-factor authentication
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Add an extra layer of security.
          </p>
        </button>

        <button
          type="button"
          onClick={onSessions}
          className="w-full rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
        >
          <p className="font-medium text-slate-900">
            Active sessions
          </p>
          <p className="text-xs text-slate-500 mt-1">
            View logged-in devices.
          </p>
        </button>
      </div>
    </div>
  )
}
