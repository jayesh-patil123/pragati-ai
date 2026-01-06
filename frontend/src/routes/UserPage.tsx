/**
 * UserPage.tsx
 *
 * - Top Profile Card
 * - 8 Info Cards
 * - Clicking a card opens a RIGHT SIDEBAR (drawer) INSIDE the main container
 */

import React from "react"
import { useAuth } from "../context/useAuth"

import {
  Award,
  LineChart,
  CreditCard,
  SlidersHorizontal,
  LifeBuoy,
  HelpCircle,
  Shield,
  X,
} from "lucide-react"



import AchievementsPage from "../components/User_Settings/AchievementsPage"
import LearningPage from "../components/User_Settings/LearningPage"
import HelpPage from "../components/User_Settings/HelpPage"
import PreferencesPage from "../components/User_Settings/PreferencesPage"
import SecurityPage from "../components/User_Settings/SecurityPage"


import SubscriptionModal from "../components/modals/SubscriptionModal"
import SupportModal from "../components/modals/SupportModal"
import ChangePasswordModal from "../components/modals/ChangePasswordModal"
import TwoFactorSetupModal from "../components/modals/TwoFactorSetupModal"
import ActiveSessionsModal from "../components/modals/ActiveSessionsModal"



type SectionId =
  | "achievements"
  | "learning"
  | "subscription"
  | "preferences"
  | "support"
  | "help"
  | "security"

interface SectionConfig {
  id: SectionId
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

interface InfoCardProps {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  onClick: () => void
}

const sections: SectionConfig[] = [
  {
    id: "achievements",
    title: "Achievements",
    icon: Award,
    description: "Badges, milestones and performance highlights.",
  },
  {
    id: "learning",
    title: "Learning Progress",
    icon: LineChart,
    description: "Track what you’re learning and how far you’ve reached.",
  },
  {
    id: "subscription",
    title: "Subscription",
    icon: CreditCard,
    description: "Manage your plan, billing cycle and payments.",
  },
  {
    id: "preferences",
    title: "Preferences",
    icon: SlidersHorizontal,
    description: "Control notifications, themes and other settings.",
  },
  {
    id: "support",
    title: "Support",
    icon: LifeBuoy,
    description: "Get help from the support team.",
  },
  {
    id: "help",
    title: "Help",
    icon: HelpCircle,
    description: "FAQs, guides and general help.",
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    description: "Passwords, 2FA and device security.",
  },
]

// Small clickable card
function InfoCard({ title, icon: Icon, onClick }: InfoCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full text-left
        bg-white
        border border-slate-200
        rounded-2xl
        p-6
        min-h-[90px]
        shadow-sm
        hover:shadow-lg hover:border-slate-300
        cursor-pointer
        transition
        flex items-start gap-5
        focus:outline-none focus:ring-2 focus:ring-slate-900/40
      "
    >
      {/* Icon */}
      <div
        className="
          h-12 w-12
          rounded-2xl
          bg-slate-900 text-white
          flex items-center justify-center
          shrink-0
        "
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Manage details &amp; info
        </p>
      </div>
    </button>
  )
}



function getInitials(name?: string): string {
  if (!name) return ""

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0][0].toUpperCase()
  }

  return (
    parts[0][0].toUpperCase() +
    parts[parts.length - 1][0].toUpperCase()
  )
}

export default function UserPage(): React.JSX.Element {
  const { user } = useAuth()

  const [activeView, setActiveView] = React.useState<
    | "achievements"
    | "learning"
    | "help"
    | "preferences"
    | "security"
    | null
  >(null)


  const [showSubscription, setShowSubscription] = React.useState(false)
  const [showSupport, setShowSupport] = React.useState(false)
  const [showChangePassword, setShowChangePassword] = React.useState(false)
  const [showTwoFactor, setShowTwoFactor] = React.useState(false)
  const [showSessions, setShowSessions] = React.useState(false)


  return (
    <div
      className="
        h-full w-full
        flex items-center justify-center
        bg-slate-100
        px-3 md:px-6 py-4 md:py-6
      "
    >
      {/* Inner white panel */}
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
            User Profile
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            View account details, learning progress, and settings.
          </p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6">
          {/* Profile Card */}
          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              p-6
              shadow-sm hover:shadow-md
              transition
              flex items-center gap-4
              max-w-xl
            "
          >
            {/* Avatar */}
            <div
              className="
                h-16 w-16
                rounded-full
                bg-slate-500
                text-white
                flex items-center justify-center
                text-lg font-semibold
                select-none
              "
            >
              {getInitials(user?.name)}
            </div>

            {/* User details */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                {user?.name || "Loading..."}
              </h2>
              <p className="text-xs md:text-sm text-slate-600">
                {user?.email || "Loading..."}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((section) => (
              <InfoCard
                key={section.id}
                title={section.title}
                icon={section.icon}
                onClick={() => {
                  if (section.id === "achievements") setActiveView("achievements")
                  else if (section.id === "learning") setActiveView("learning")
                  else if (section.id === "help") setActiveView("help")
                  else if (section.id === "preferences") setActiveView("preferences")
                  else if (section.id === "security") setActiveView("security")
                  else if (section.id === "subscription") setShowSubscription(true)
                  else if (section.id === "support") setShowSupport(true)
                }}
              />
            ))}
          </div>
        </div>

        

        {/* === RIGHT SIDEBAR / DRAWER (inside container) === */}
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
            ${activeView ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="h-full flex flex-col">

            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-900">
                Details
              </span>

              <button
                type="button"
                onClick={() => setActiveView(null)}
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

            {/* Sidebar Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {activeView === "achievements" && <AchievementsPage />}
              {activeView === "learning" && <LearningPage />}
              {activeView === "help" && <HelpPage />}
              {activeView === "preferences" && <PreferencesPage />}
              {activeView === "security" && (
                <SecurityPage
                  onChangePassword={() => {
                    setActiveView(null)
                    setShowChangePassword(true)
                  }}
                  onTwoFactor={() => {
                    setActiveView(null)
                    setShowTwoFactor(true)
                  }}
                  onSessions={() => {
                    setActiveView(null)
                    setShowSessions(true)
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <SubscriptionModal
          open={showSubscription}
          onClose={() => setShowSubscription(false)}
        />

        <SupportModal
          open={showSupport}
          onClose={() => setShowSupport(false)}
        />

        <ChangePasswordModal
          open={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />

        <TwoFactorSetupModal
          open={showTwoFactor}
          onClose={() => setShowTwoFactor(false)}
        />

        <ActiveSessionsModal
          open={showSessions}
          onClose={() => setShowSessions(false)}
        />
      </div>
    </div>
  )
}
