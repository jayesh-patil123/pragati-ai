import React, { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  Youtube,
  GraduationCap,
  FolderGit2,
  NotebookText,
  Code,
  TerminalSquare,
  Binary,
  X,
} from "lucide-react"

/* ------------------------------------------------------------------
 * Detail components (NO API LOGIC HERE)
 * ------------------------------------------------------------------ */

import Documents from "./Learning_Resources/Documents"
import YouTubeLectures from "./Learning_Resources/YouTubeLectures"
import Courses from "./Learning_Resources/Courses"

import ExploreRepos from "./GitHub_Projects/Explore_repos"
import NotesFlashcards from "./GitHub_Projects/Notes_&_Flashcards"

import CodingChallenges from "./HandsOn_Practice/CodingChallenges"
import PracticePython from "./HandsOn_Practice/PracticePython"
import HackerRankSql from "./HandsOn_Practice/HackerRankSql"

import RoleBasedIndex from "./Personalized_Learning_Paths/RoleBasedIndex"

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type DashboardCardKey =
  | "documents"
  | "youtube"
  | "courses"
  | "exploreRepos"
  | "notesFlashcards"
  | "codingChallenges"
  | "practicePython"
  | "hackerRankSql"
  | "sectors"
  | null

interface CardProps {
  title: string
  subtitle?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  onClick?: () => void
}

/* ------------------------------------------------------------------
 * Reusable Card
 * ------------------------------------------------------------------ */

function HubCard({
  title,
  subtitle,
  icon: Icon,
  onClick,
}: CardProps): React.JSX.Element {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          onClick()
        }
      }}
      className="
        bg-white
        rounded-2xl
        border border-slate-200
        p-4
        shadow-sm
        hover:shadow-md
        hover:border-slate-300
        transition
        cursor-pointer
        flex items-start gap-3
      "
    >
      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-600">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * Dashboard
 * ------------------------------------------------------------------ */

export default function Dashboard(): React.JSX.Element {
  const [activeCard, setActiveCard] =
    useState<DashboardCardKey>(null)

  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const isOpen = activeCard !== null

  function closePanel() {
    setActiveCard(null)
  }

  /* Close on ESC */
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel()
    }

    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  /* Focus management */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 80)
    }
  }, [isOpen])

  const renderDetails = () => {
    switch (activeCard) {
      case "documents":
        return <Documents />
      case "youtube":
        return <YouTubeLectures />
      case "courses":
        return <Courses />
      case "exploreRepos":
        return <ExploreRepos />
      case "notesFlashcards":
        return <NotesFlashcards />
      case "codingChallenges":
        return <CodingChallenges />
      case "practicePython":
        return <PracticePython />
      case "hackerRankSql":
        return <HackerRankSql />
      case "sectors":
        return <RoleBasedIndex />
      default:
        return (
          <p className="text-sm text-slate-500">
            Select a card to view details.
          </p>
        )
    }
  }

  const panelTitle: string = (() => {
    switch (activeCard) {
      case "documents":
        return "Documents"
      case "youtube":
        return "YouTube Lectures"
      case "courses":
        return "Courses"
      case "exploreRepos":
        return "Explore Repositories"
      case "notesFlashcards":
        return "Notes & Flashcards"
      case "codingChallenges":
        return "Coding Challenges"
      case "practicePython":
        return "Practice Python"
      case "hackerRankSql":
        return "SQL Exercises"
      case "sectors":
        return "Explore Industries"
      default:
        return "Details"
    }
  })()

  return (
    <div className="space-y-8 relative">
      {/* Learning Resources */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Learning Resources
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <HubCard
            title="Documents"
            subtitle="Read AI fundamentals"
            icon={BookOpen}
            onClick={() => setActiveCard("documents")}
          />
          <HubCard
            title="YouTube Lectures"
            subtitle="Full-length tutorials"
            icon={Youtube}
            onClick={() => setActiveCard("youtube")}
          />
          <HubCard
            title="Courses"
            subtitle="Structured learning paths"
            icon={GraduationCap}
            onClick={() => setActiveCard("courses")}
          />
        </div>
      </section>

      {/* GitHub Projects */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          GitHub Projects
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <HubCard
            title="Explore Repos"
            subtitle="Open-source AI & ML"
            icon={FolderGit2}
            onClick={() => setActiveCard("exploreRepos")}
          />
          <HubCard
            title="Notes & Flashcards"
            subtitle="Summaries & recall"
            icon={NotebookText}
            onClick={() => setActiveCard("notesFlashcards")}
          />
        </div>
      </section>

      {/* Hands-On Practice */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Hands-On Practice
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <HubCard
            title="Coding Challenges"
            subtitle="Problem solving"
            icon={Code}
            onClick={() => setActiveCard("codingChallenges")}
          />
          <HubCard
            title="Practice Python"
            subtitle="Exercises"
            icon={TerminalSquare}
            onClick={() => setActiveCard("practicePython")}
          />
          <HubCard
            title="SQL Exercises"
            subtitle="HackerRank-style"
            icon={Binary}
            onClick={() => setActiveCard("hackerRankSql")}
          />
        </div>
      </section>

      {/* Industries */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Explore by Industry
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <HubCard
            title="Explore Sectors"
            subtitle="IT, Marketing, HR & more"
            icon={BookOpen}
            onClick={() => setActiveCard("sectors")}
          />
        </div>
      </section>

      {/* Overlay */}
      <div
        aria-hidden={!isOpen}
        onClick={closePanel}
        className={`absolute inset-0 z-40 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Slide-over Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute inset-0 z-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full w-full bg-white flex flex-col overflow-auto">
          <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {panelTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Press Esc or close to exit
              </p>
            </div>

            <button
              ref={closeButtonRef}
              onClick={closePanel}
              className="p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="p-6">{renderDetails()}</div>
        </div>
      </aside>
    </div>
  )
}
