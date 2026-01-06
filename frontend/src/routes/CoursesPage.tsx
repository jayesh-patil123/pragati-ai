/**
 * CoursesPage.tsx
 *
 * Clean courses dashboard with 3 tabs:
 * - Courses
 * - Categories
 * - AI Tutor
 */

import React, { useEffect, useState } from "react"
import type { JSX } from "react"
import {
  Brain,
  Database,
  Code2,
  Cloud,
  AppWindow,
  Shield,
  Lightbulb,
  Users2,
  Clock,
  BriefcaseBusiness,
} from "lucide-react"

import AITutor from "./AI_tutor"


type CoursesTab = "courses" | "categories" | "aiTutor"

interface CategoryCardProps {
  title: string
  description?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  onClick?: () => void
  active?: boolean
}

function CategoryCard({
  title,
  description,
  icon: Icon,
  onClick,
  active,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        bg-white
        border rounded-2xl
        p-3 md:p-4
        shadow-sm hover:shadow-md
        transition cursor-pointer
        flex flex-col items-center gap-2
        text-center
        ${active ? "border-slate-900" : "border-slate-200"}
      `}
    >
      <div
        className="
          h-12 w-12 md:h-14 md:w-14
          flex items-center justify-center
          rounded-2xl bg-slate-900
          text-white
        "
      >
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-xs md:text-sm text-slate-800 font-semibold">
        {title}
      </p>
      {description && (
        <p className="text-[10px] md:text-xs text-slate-500">
          {description}
        </p>
      )}
    </button>
  )
}

interface MicroCardProps {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function MicroCard({ title, icon: Icon }: MicroCardProps) {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        p-3
        shadow-sm hover:shadow-md
        text-center
        flex flex-col items-center gap-2
      "
    >
      <Icon className="h-6 w-6 text-slate-900" />
      <p className="text-xs font-semibold text-slate-700">{title}</p>
    </div>
  )
}

function CourseCard({
  title,
  level,
  duration,
  onClick,
}: {
  title: string
  level?: string
  duration?: string
  onClick?: () => void
}) {
  return (
    <div
    onClick={onClick}
      className="
        bg-white border border-slate-200 rounded-2xl
        p-4 shadow-sm hover:shadow-md cursor-pointer transition
        flex flex-col gap-1
      "
    >
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {level === "Advanced" && (
        <span className="text-[10px] text-red-600 font-semibold">
          Advanced
        </span>
      )}

      {(level || duration) && (
        <p className="text-[11px] text-slate-500">
          {level && <span>{level}</span>}
          {level && duration && <span> · </span>}
          {duration && <span>{duration}</span>}
        </p>
      )}
      <p className="text-xs text-slate-500 mt-1">Continue learning</p>
    </div>
  )
}

// ---- DATA ----
type Level = "Beginner" | "Intermediate" | "Advanced"
type CourseStatus = "ongoing" | "recommended" | "library"

interface Course {
  id: string
  title: string
  category: string
  level: Level
  duration?: string
  status: CourseStatus

  // Advanced / Enterprise
  progress?: number
  rating?: number
  skills?: string[]
  prerequisites?: string[]
  jobRoles?: string[]
  isTrending?: boolean
  isNew?: boolean
  lastUpdated?: string
}

export default function CoursesPage(): JSX.Element {
  const [courses, setCourses] = useState<Course[]>([])

  const [loading, setLoading] = useState(true)
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)


  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load courses")
        return res.json()
      })
      .then((data) => {
        setCourses(data.courses || [])
      })
      .catch(() => {
        console.error("Failed to fetch courses from backend")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const [activeTab, setActiveTab] = useState<CoursesTab>("courses")
  const [selectedCategory, setSelectedCategory] = useState<string>(
    "Data Science"
  )
  const [activeLevelFilter, setActiveLevelFilter] = useState<Level | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    setVisibleCount(8)
  }, [activeLevelFilter, searchQuery, selectedCategory])

  const tabButtonClasses = (tab: CoursesTab) =>
    `
      px-4 py-1.5 rounded-full
      text-xs md:text-sm font-medium
      border border-slate-300
      whitespace-nowrap
      ${
        activeTab === tab
          ? "bg-slate-200 text-black border-slate-400 shadow-sm"
          : "bg-white text-slate-700 hover:bg-slate-100"
      }
    `

  const levelFilters: Level[] = ["Beginner", "Intermediate", "Advanced"]

  const filterCoursesByLevel = (courses: Course[]) => {
    let filtered = courses

    if (activeLevelFilter) {
      filtered = filtered.filter(
        (course) => course.level === activeLevelFilter
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      )
    }

    if (searchQuery) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getCoursesByStatus = (status: CourseStatus) =>
    filterCoursesByLevel(
      courses.filter((course) => course.status === status)
    )

  // --- COURSES TAB ---
  const renderCoursesTab = () => {
    if (loading) {
      return (
        <p className="text-center text-xs text-slate-500">
          Loading courses from server...
        </p>
      )
    }
    const filteredOngoing = getCoursesByStatus("ongoing")
    const filteredRecommended = getCoursesByStatus("recommended")
    const filteredLibrary = getCoursesByStatus("library")

    return (
      <>
        {/* Filters row */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Your Courses Overview
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Track your ongoing learning and discover AI-recommended courses.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] md:text-xs items-center">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 rounded-full border text-[11px]"
            />
              <span className="self-center text-slate-500 mr-1">
                Filter by level:
              </span>
              {levelFilters.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setActiveLevelFilter((prev) =>
                      prev === level ? null : level
                    )
                  }
                  className={`
                  px-3 py-1 rounded-full border
                  ${
                    activeLevelFilter === level
                      ? "bg-slate-200 text-black border-slate-500"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }
                  text-[11px] md:text-xs
                `}
                >
                  {level}
                </button>
              ))}
              {activeLevelFilter && (
                <button
                  type="button"
                  onClick={() => setActiveLevelFilter(null)}
                  className="
                    text-[11px] md:text-xs underline text-slate-500 ml-1
                  "
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Ongoing */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Your Ongoing Courses
          </h2>

          {filteredOngoing.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              No ongoing courses match the selected level.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOngoing.map((course) => (
                <CourseCard
                  key={course.title}
                  title={course.title}
                  level={course.level}
                  duration={course.duration}
                  onClick={() => setSelectedCourse(course)}
                />
              ))}
            </div>
          )}
        </section>

        {/* AI Recommended */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            AI-Recommended Courses
          </h2>

          {filteredRecommended.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              No recommended courses match the selected level.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecommended.map((course) => (
                <CourseCard
                  key={course.title}
                  title={course.title}
                  level={course.level}
                  duration={course.duration}
                  onClick={() => setSelectedCourse(course)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Course Library */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Course Library
            </h2>
            <button
              type="button"
              className="
                text-[11px] md:text-xs
                px-3 py-1.5 rounded-full
                border border-slate-300 bg-white hover:bg-slate-50
                text-slate-700
              "
            >
              View all
            </button>
          </div>

          {filteredLibrary.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              No courses in the library match the selected level.
            </p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredLibrary.slice(0, visibleCount).map((course) => (
                  <CourseCard
                    key={course.title}
                    title={course.title}
                    level={course.level}
                    onClick={() => setSelectedCourse(course)}
                  />
                ))}
              </div>

              {filteredLibrary.length > visibleCount && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="text-xs underline text-slate-600"
                  >
                    Load more courses
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* AI Course Assistant */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            AI Course Assistant
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MicroCard title="What will I learn?" icon={Lightbulb} />
            <MicroCard title="Who is this for?" icon={Users2} />
            <MicroCard title="How long is this?" icon={Clock} />
            <MicroCard title="Job Opportunities" icon={BriefcaseBusiness} />
          </div>
        </section>
      </>
    )
  }

  // --- CATEGORIES TAB ---
  const renderCategoriesTab = () => (
    <>
      {/* Featured Categories */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Featured Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <CategoryCard
            title="Data Science"
            description="Python · pandas · SQL"
            icon={Database}
            active={selectedCategory === "Data Science"}
            onClick={() => setSelectedCategory("Data Science")}
          />
          <CategoryCard
            title="Artificial Intelligence"
            description="ML · DL · NLP"
            icon={Brain}
            active={selectedCategory === "Artificial Intelligence"}
            onClick={() => setSelectedCategory("Artificial Intelligence")}
          />
          <CategoryCard
            title="Web Development"
            description="Frontend · Backend"
            icon={Code2}
            active={selectedCategory === "Web Development"}
            onClick={() => setSelectedCategory("Web Development")}
          />
          <CategoryCard
            title="Cloud Computing"
            description="AWS · Azure · GCP"
            icon={Cloud}
            active={selectedCategory === "Cloud Computing"}
            onClick={() => setSelectedCategory("Cloud Computing")}
          />
          <CategoryCard
            title="App Development"
            description="Mobile · Cross-platform"
            icon={AppWindow}
            active={selectedCategory === "App Development"}
            onClick={() => setSelectedCategory("App Development")}
          />
          <CategoryCard
            title="Cyber Security"
            description="Network · Defense"
            icon={Shield}
            active={selectedCategory === "Cyber Security"}
            onClick={() => setSelectedCategory("Cyber Security")}
          />
        </div>
      </section>

      {/* Category details + sample courses */}
      <section
        className="
          mt-4 border border-slate-200 rounded-2xl
          bg-slate-50 p-4 md:p-5 text-xs md:text-sm
          grid gap-4 md:grid-cols-[1.5fr_minmax(0,1fr)]
        "
      >
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            {selectedCategory}
          </h3>
          <p className="text-slate-600 mb-2">
            Explore curated courses, skills and projects in{" "}
            <span className="font-semibold">{selectedCategory}</span>. AI can
            suggest the next best course based on what you&apos;re learning.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-600">
            <li>Browse beginner, intermediate and advanced tracks.</li>
            <li>Combine multiple categories to design your own path.</li>
            <li>
              Get role-based recommendations (e.g. Data Scientist, ML Engineer).
            </li>
          </ul>
        </div>

        <div className="border-l border-slate-200 pl-4 space-y-2">
          <h4 className="text-xs font-semibold text-slate-900 mb-1">
            Suggested courses in {selectedCategory}
          </h4>
          <ul className="space-y-1 text-[11px] text-slate-700">
            <li>• Intro to {selectedCategory}</li>
            <li>• {selectedCategory} – Hands-on Projects</li>
            <li>• {selectedCategory} – Interview Prep</li>
          </ul>
        </div>
      </section>
    </>
  )

  // --- AI TUTOR TAB ---
  const renderAiTutorTab = () => (
    <section className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            AI Tutor for Courses
          </h2>
          <p className="text-[11px] text-slate-600 mt-1">
            Ask questions about any course, topic, or concept while you learn.
          </p>
        </div>
      </div>

      <div
        className="
          flex-1 min-h-80
          border border-slate-200 rounded-2xl bg-slate-50
          p-2 md:p-3
        "
      >
        <AITutor />
      </div>
    </section>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "categories":
        return renderCategoriesTab()
      case "aiTutor":
        return renderAiTutorTab()
      case "courses":
      default:
        return renderCoursesTab()
    }
  }

  return (
    <div
      className="
        h-full w-full
        flex items-center justify-center
        bg-slate-100
        px-3 md:px-6 py-4 md:py-6
      "
    >
      <div
        className="
          w-full max-w-6xl h-full
          bg-white rounded-[28px]
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
            Courses
          </h1>

          {/* Tabs */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                className={tabButtonClasses("courses")}
                onClick={() => setActiveTab("courses")}
                type="button"
                aria-pressed={activeTab === "courses"}
              >
                Courses
              </button>
              <button
                className={tabButtonClasses("categories")}
                onClick={() => setActiveTab("categories")}
                type="button"
                aria-pressed={activeTab === "categories"}
              >
                Categories
              </button>
              <button
                className={tabButtonClasses("aiTutor")}
                onClick={() => setActiveTab("aiTutor")}
                type="button"
                aria-pressed={activeTab === "aiTutor"}
              >
                AI Tutor
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div
          className="
            flex-1 overflow-y-auto
            px-6 md:px-8 py-5 md:py-7
            space-y-8
          "
        >
          {renderContent()}
          {selectedCourse && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedCourse.title}
                </h2>

                <p className="text-sm text-slate-600 mt-2">
                  Level: {selectedCourse.level}
                </p>

                {selectedCourse.duration && (
                  <p className="text-sm text-slate-600 mt-1">
                    Duration: {selectedCourse.duration}
                  </p>
                )}
                {selectedCourse.skills && (
                  <p className="text-sm text-slate-600 mt-2">
                    Skills: {selectedCourse.skills.join(", ")}
                  </p>
                )}

                {selectedCourse.jobRoles && (
                  <p className="text-sm text-slate-600 mt-1">
                    Job Roles: {selectedCourse.jobRoles.join(", ")}
                  </p>
                )}

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-4 py-2 text-sm border rounded-lg"
                  >
                    Close
                  </button>

                  <button
                    className="px-4 py-2 text-sm bg-slate-900 text-black rounded-lg"
                  >
                    Enroll / Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
