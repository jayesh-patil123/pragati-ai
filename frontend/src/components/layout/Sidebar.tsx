// Sidebar.tsx

import { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  Home,
  MessageCircle,
  Bot,
  BookOpenCheck,
  GraduationCap,
  User,
  Settings,
  FolderOpen,
} from "lucide-react"

// 👉 update the path to match your project
import pragatiLogo from "/src/assets/Logo/PRAGATI_AI.png"

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/chat", label: "Chat", icon: MessageCircle },
  { path: "/agents", label: "Agents", icon: Bot },
  { path: "/learning", label: "Learning", icon: BookOpenCheck },
  { path: "/courses", label: "Courses", icon: GraduationCap },
  { path: "/files", label: "Files", icon: FolderOpen },
]

const bottomItems = [
  { path: "/user", label: "User", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true) // default: menu visible

  const allItems = [...navItems, ...bottomItems]

  return (
    <aside
      className="
        w-20 md:w-24
        h-full
        bg-slate-100
        border border-slate-400
        rounded-4xl
        flex flex-col items-center
        py-4
      "
    >
      {/* Top: Logo + Burger */}
      <div className="flex flex-col items-center gap-4">
        {/* REAL LOGO */}
        <div className="flex flex-col items-center gap-1">
          <img
            src={pragatiLogo}
            alt="Pragati AI logo"
            className="h-18 w-18 object-contain"
          />
        </div>

        {/* Burger button – toggles all 7 items */}
        {/* Burger button – Animated Hamburger */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            h-10 w-10
            flex flex-col items-center justify-center
            gap-[3px]
            rounded-xl
            bg-white
            border border-slate-400
            shadow-sm
            transition-all duration-300
            active:scale-95
          "
        >
          <span
            className={`
              block h-0.5 w-6 bg-slate-700 rounded transition-all duration-300
              ${isOpen ? "rotate-45 translate-y-1.5" : ""}
            `}
          />
          <span
            className={`
              block h-0.5 w-6 bg-slate-700 rounded transition-all duration-300
              ${isOpen ? "opacity-0" : ""}
            `}
          />
          <span
            className={`
              block h-0.5 w-6 bg-slate-700 rounded transition-all duration-300
              ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}
            `}
          />
        </button>

      </div>

      {/* Slide-down menu block (all 7 items) */}
      <div className="mt-4 w-full flex-1 overflow-hidden">
        <div
          className={`
            flex flex-col items-center gap-3
            transition-all duration-300 ease-in-out
            ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
          `}
        >
          {allItems.map(({ path, label, icon: Icon }, index) => (
            <div
              key={path}
              className={index === navItems.length ? "mt-14" : ""} // ← adds space before item 6
            >
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `
                  h-10 w-10
                  rounded-xl
                  flex items-center justify-center
                  border
                  ${
                    isActive
                      ? "bg-cyan-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-200"
                  }
                `
                }
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{label}</span>
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
