/**
 * SettingsPage.tsx
 *
 * - White rounded container
 * - Settings cards
 * - Clicking a card opens a RIGHT SIDEBAR (drawer) INSIDE this container
 */

import React, { useEffect, useState } from "react"
import { useAuth } from "../context/useAuth"
import ChangePasswordModal from "../components/modals/ChangePasswordModal"
import { useNavigate } from "react-router-dom"
import { fetchSettings } from "../services/settingsService"
import type { AppSettings } from "../types/settings"
import ActiveSessionsModal from "../components/modals/ActiveSessionsModal"
import TrustedDevicesModal from "../components/modals/TrustedDevicesModal"
import TwoFactorSetupModal from "../components/modals/TwoFactorSetupModal"

import { EditProfileModal } from "../components/modals/EditProfileModal"
import { UpdateEmailModal } from "../components/modals/UpdateEmailModal"
import { DeleteAccountModal } from "../components/modals/DeleteAccountModal"
import GeneralSettingsModal from "../components/modals/GeneralSettingsModal"

import {
  Settings,
  GraduationCap,
  ShieldCheck,
  Bell,
  UserCog,
  LogOut,
  X,
} from "lucide-react"

type SettingId =
  | "general"
  | "learning"
  | "security"
  | "notifications"
  | "account"
  | "logout"

interface SettingConfig {
  id: SettingId
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  subtitle: string
  description: string
  danger?: boolean
}

interface SettingCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  subtitle: string
  danger?: boolean
  onClick: () => void
}

const settingConfigs: SettingConfig[] = [
  {
    id: "general",
    icon: Settings,
    title: "General",
    subtitle: "System fundamentals",
    description: "Basic app behavior, language and core preferences.",
  },
  {
    id: "learning",
    icon: GraduationCap,
    title: "Learning",
    subtitle: "Your courses and learning preferences",
    description: "Control how learning content and recommendations work.",
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Security",
    subtitle: "Passwords, sessions, verification",
    description: "Keep your account safe and protected.",
  },
  
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    subtitle: "Update settings and alerts",
    description: "Manage when and how we notify you.",
  },
  {
    id: "account",
    icon: UserCog,
    title: "Account",
    subtitle: "Profile and access details",
    description: "Update your personal info and account details.",
  },
  {
    id: "logout",
    icon: LogOut,
    title: "Log out",
    subtitle: "Exit your account safely",
    description: "End your session securely.",
    danger: true,
  },
]

// Card component
function SettingCard({
  icon: Icon,
  title,
  subtitle,
  danger,
  onClick,
}: SettingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left
        bg-white
        border border-slate-200
        rounded-2xl
        p-6
        min-h-[90px]
        shadow-sm
        hover:shadow-md
        cursor-pointer
        transition
        flex items-start gap-6
        focus:outline-none focus:ring-2 focus:ring-slate-900/40
        ${danger ? "hover:border-red-300" : ""}
      `}
    >
      {/* Icon bubble */}
      <div
        className={`
          h-12 w-12 rounded-2xl
          flex items-center justify-center
          shrink-0
          ${danger ? "bg-red-600 text-white" : "bg-slate-900 text-white"}
        `}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Details */}
      <div>
        <h3
          className={`
            text-base font-semibold
            ${danger ? "text-red-600" : "text-slate-900"}
          `}
        >
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
    </button>
  )
}

// Reusable option row inside sidebar
function OptionItem({
  title,
  subtitle,
  danger,
  onClick,
}: {
  title: string
  subtitle?: string
  danger?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left
        border rounded-xl
        px-3 py-2.5
        transition
        ${
          danger
            ? "border-red-200 hover:border-red-300 hover:bg-red-50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <p
        className={`
          text-sm font-medium
          ${danger ? "text-red-600" : "text-slate-900"}
        `}
      >
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      )}
    </button>
  )
}


// Drawer content based on selected setting
function DrawerContent({
  settingId,
  settings,
  onLogout,
  onGeneralAction,
  onLearningAction,
  onSecurityAction,
  onNotificationAction,
  onAccountAction,
}: {
  settingId: SettingId
  settings: AppSettings | null
  onLogout: () => Promise<void>

  onGeneralAction: (action: string) => void
  onLearningAction: (action: string) => void
  onSecurityAction: (action: string) => void
  onNotificationAction: (action: string) => void
  onAccountAction: (action: string) => void
}) {
  
  const [logoutOpen, setLogoutOpen] = React.useState<boolean>(false)
  const confirmRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
      if (logoutOpen && confirmRef.current) {
        confirmRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        })
      }
    }, [logoutOpen])


  switch (settingId) {
    case "general":
      return (
        <>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            General Settings
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Adjust core behavior and basic preferences.
          </p>

          <div className="space-y-3 text-sm">
            <OptionItem
              title="Language"
              subtitle={settings ? settings.general.language : "Loading..."}
              onClick={() => onGeneralAction("language")}
            />

            <OptionItem
              title="Region & time zone"
              subtitle="Set local time and formatting."
              onClick={() => onGeneralAction("timezone")}
            />

            <OptionItem
              title="Default home screen"
              subtitle="Choose what you see after login."
              onClick={() => onGeneralAction("home")}
            />
          </div>
        </>
      )

    case "learning":
      return (
        <>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Learning Settings
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Configure how your learning experience behaves.
          </p>

          <div className="space-y-3 text-sm">
            <OptionItem
              title="Learning reminders"
              subtitle="Enable daily or weekly study reminders."
              onClick={() => onLearningAction("reminders")}
            />

            <OptionItem
              title="Recommended content"
              subtitle="Allow personalized course suggestions."
              onClick={() => onLearningAction("recommendations")}
            />

            <OptionItem
              title="Progress sync"
              subtitle="Sync progress across your devices."
              onClick={() => onLearningAction("sync")}
            />
          </div>
        </>
      )

    case "security":
      return (
        <>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Security
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Protect your account and sessions.
          </p>

          <div className="space-y-3 text-sm">
            <OptionItem
              title="Change password"
              subtitle="Update your account password."
              onClick={() => onSecurityAction("change_password")}
            />

            <OptionItem
              title="Two-factor authentication"
              subtitle="Add an extra verification step."
              onClick={() => onSecurityAction("2fa")}
            />

            <OptionItem
              title="Active sessions"
              subtitle="View and sign out of open sessions."
              onClick={() => onSecurityAction("sessions")}
            />

            <OptionItem
              title="Trusted devices"
              subtitle="Manage devices that don’t require verification."
              onClick={() => onSecurityAction("devices")}
            />
          </div>
        </>
      )

    case "notifications":
      return (
        <>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Notifications
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Decide when and how we contact you.
          </p>

          <div className="space-y-3 text-sm">
            <OptionItem
              title="Email notifications"
              subtitle="Course updates, reminders and tips."
              onClick={() => onNotificationAction("email")}
            />

            <OptionItem
              title="Push notifications"
              subtitle="Alerts on your phone or desktop."
              onClick={() => onNotificationAction("push")}
            />

            <OptionItem
              title="Digest emails"
              subtitle="Weekly summary of your activity."
              onClick={() => onNotificationAction("digest")}
            />
          </div>
        </>
      )

    case "account":
      return (
        <>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Account
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Update your identity and account data.
          </p>

          <div className="space-y-3 text-sm">
            <OptionItem
              title="Personal information"
              subtitle="Name, username and contact details."
              onClick={() => onAccountAction("profile")}
            />

            <OptionItem
              title="Email & phone"
              subtitle="Manage login and recovery details."
              onClick={() => onAccountAction("contact")}
            />

            <OptionItem
              title="Delete account"
              subtitle="Request account deletion."
              danger
              onClick={() => onAccountAction("delete")}
            />
          </div>
        </>
      )

    case "logout":
      return (
        <>
          <h2 className="text-lg font-semibold text-red-600 mb-1">
            Log out
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            End your session safely on this device.
          </p>

          <div className="space-y-3 text-sm">
            {/* Toggle row */}
            <button
              type="button"
              onClick={() => setLogoutOpen((v: boolean) => !v)}
              className="
                w-full
                flex items-center justify-between
                border border-red-200
                rounded-xl
                px-3 py-2.5
                text-left
                hover:bg-red-50
                transition
              "
            >
              <div>
                <p className="text-sm font-medium text-red-600">
                  Log out from this device
                </p>
                <p className="text-xs text-slate-500">
                  End the current session
                </p>
              </div>

              <span
                className={`
                  text-xs font-medium text-red-600
                  transition-transform duration-200
                  ${logoutOpen ? "rotate-180" : ""}
                `}
              >
                ▾
              </span>
            </button>

            {/* Slide-down confirmation */}
            <div
              className={`
                grid transition-[grid-template-rows,opacity]
                duration-300 ease-out
                ${logoutOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
              `}
            >
                <div ref={confirmRef} className="overflow-hidden pt-3">
                <button
                  onClick={onLogout}
                  className="
                    w-full
                    rounded-xl
                    bg-red-600
                    px-4 py-2
                    text-sm font-medium
                    text-red-500
                    hover:bg-red-700
                    transition
                  "
                >
                  Confirm Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )

    default:
      return null
  }
}


export default function SettingsPage(): React.JSX.Element {
  const [showChangePassword, setShowChangePassword] = useState(false)

  const [showSessions, setShowSessions] = useState(false)
  const [showDevices, setShowDevices] = useState(false)
  const [show2FA, setShow2FA] = useState(false)

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showUpdateEmail, setShowUpdateEmail] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  const [showGeneralSettings, setShowGeneralSettings] = useState(false)

  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login", { replace: true })
    } catch {
      alert("Logout failed")
    }
  }

  const handleGeneralAction = () => {
    closeDrawer()
    setShowGeneralSettings(true)
  }

  const handleLearningAction = (action: string) => {
    closeDrawer()
    console.log("Learning action:", action)
  }

  const handleSecurityAction = (action: string) => {
    closeDrawer() // ✅ always close drawer before opening modal

    switch (action) {
      case "change_password":
        setShowChangePassword(true)
        break
      case "sessions":
        setShowSessions(true)
        break
      case "devices":
        setShowDevices(true)
        break
      case "2fa":
        setShow2FA(true)
        break
    }
  }

  const handleNotificationAction = (action: string) => {
    closeDrawer()
    console.log("Notification action:", action)
  }

  const handleAccountAction = (action: string) => {
    closeDrawer()

    if (action === "profile") setShowEditProfile(true)
    if (action === "contact") setShowUpdateEmail(true)
    if (action === "delete") setShowDeleteAccount(true)
  }

  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch(() => {
        console.error("Failed to load settings")
        setSettings(null)
      })
  }, [])


  const [activeSetting, setActiveSetting] = React.useState<SettingId | null>(
    null
  )

  const openDrawer = (id: SettingId) => setActiveSetting(id)
  const closeDrawer = () => setActiveSetting(null)

  const activeConfig =
    settingConfigs.find((s) => s.id === activeSetting) || null

  const isAnyModalOpen =
    showChangePassword ||
    showSessions ||
    showDevices ||
    show2FA ||
    showEditProfile ||
    showUpdateEmail ||
    showDeleteAccount ||
    showGeneralSettings

  return (
    <div
      className="
        h-full w-full
        flex items-center justify-center
        bg-slate-100
        px-3 md:px-6 py-4 md:py-6
      "
    >
      {/* Main container */}
      <div
        className="
          relative
          w-full max-w-6xl
          h-full
          bg-white
          rounded-[28px]
          border border-slate-200
          shadow-[0_0_40px_rgba(15,23,42,0.12)]
          flex flex-col overflow-hidden
        "
      >
        {/* Header */}
        <header
          className="
            px-6 md:px-8 py-4 md:py-5
            border-b border-slate-200
            bg-slate-50
          "
        >
          <h1 className="text-lg md:text-xl font-semibold text-slate-900">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage your account, preferences, and system behavior.
          </p>
        </header>

        {/* Content */}
        <div
          className="
            flex-1 overflow-y-auto
            px-6 md:px-8 py-6
          "
        >
          <div
            className="
              grid gap-6
              sm:grid-cols-2 lg:grid-cols-3
            "
          >
            {settingConfigs.map((cfg) => (
              <SettingCard
                key={cfg.id}
                icon={cfg.icon}
                title={cfg.title}
                subtitle={cfg.subtitle}
                danger={cfg.danger}
                onClick={() => openDrawer(cfg.id)}
              />
            ))}
          </div>
        </div>

        {/* Overlay inside the container */}
        <div
          className={`
            absolute inset-0 z-40
            bg-black/10
            transition-opacity
            ${
              activeSetting && !isAnyModalOpen
                ? "opacity-100 visible pointer-events-auto"
                : "opacity-0 invisible pointer-events-none"
            }
          `}
          onClick={closeDrawer}
        />

        {/* Right drawer inside the container */}
        <div
          className={`
            absolute inset-y-0 right-0 z-50
            h-full
            w-full max-w-md
            bg-white
            shadow-xl
            border-l border-slate-200
            transform
            transition-transform duration-300 ease-out
            ${activeSetting ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              {activeConfig ? (
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      h-9 w-9 rounded-lg
                      flex items-center justify-center
                      ${
                        activeConfig.danger
                          ? "bg-red-600 text-white"
                          : "bg-slate-900 text-white"
                      }
                    `}
                  >
                    <activeConfig.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p
                      className={`
                        text-sm font-semibold
                        ${
                          activeConfig.danger
                            ? "text-red-600"
                            : "text-slate-900"
                        }
                      `}
                    >
                      {activeConfig.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activeConfig.description}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-sm font-semibold text-slate-900">
                  Details
                </span>
              )}

              <button
                type="button"
                onClick={closeDrawer}
                className="
                  rounded-full
                  p-1.5
                  hover:bg-slate-100
                  text-slate-500
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeSetting && (
                <DrawerContent
                  settingId={activeSetting}
                  settings={settings}
                  onLogout={handleLogout}
                  onGeneralAction={handleGeneralAction}
                  onLearningAction={handleLearningAction}
                  onSecurityAction={handleSecurityAction}
                  onNotificationAction={handleNotificationAction}
                  onAccountAction={handleAccountAction}
                />
              )}
            </div>
          </div>
        </div>
        <ChangePasswordModal
          open={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
        <ActiveSessionsModal
          open={showSessions}
          onClose={() => setShowSessions(false)}
        />

        <TrustedDevicesModal
          open={showDevices}
          onClose={() => setShowDevices(false)}
        />

        <TwoFactorSetupModal
          open={show2FA}
          onClose={() => setShow2FA(false)}
        />

        <EditProfileModal
          open={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />

        <UpdateEmailModal
          open={showUpdateEmail}
          onClose={() => setShowUpdateEmail(false)}
        />

        <DeleteAccountModal
          open={showDeleteAccount}
          onClose={() => setShowDeleteAccount(false)}
        />

        <GeneralSettingsModal
          open={showGeneralSettings}
          onClose={() => setShowGeneralSettings(false)}
        />
      </div>
    </div>
  )
}
