import React, {
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react"
import {
  ExternalLink,
  ArrowLeft,
  Cpu,
  DollarSign,
  Megaphone,
} from "lucide-react"

/* ------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------ */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

/* ------------------------------------------------------------------
 * Icon Registry (STRICT + SAFE)
 * ------------------------------------------------------------------ */

type IconComponent = React.FC<SVGProps<SVGSVGElement>>

const ICON_MAP: Record<string, IconComponent> = {
  cpu: Cpu,
  dollar: DollarSign,
  megaphone: Megaphone,
}

/* ------------------------------------------------------------------
 * Types (MATCH BACKEND EXACTLY)
 * ------------------------------------------------------------------ */

type Resource = {
  title: string
  url: string
}

type Role = {
  id: string
  title: string
  tags: string[]
  resources: Resource[]
}

type Sector = {
  id: string
  title: string
  subtitle?: string
  icon?: string // backend sends string
  roles: Role[]
}

/* ------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------ */

export default function RoleBasedIndex(): React.JSX.Element {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
  const [query, setQuery] = useState("")
  const [openRole, setOpenRole] = useState<string | null>(null)

  /* ------------------------------------------------------------------
   * Fetch sectors
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true

    const fetchSectors = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/v1/learning/paths/roles`,
          { credentials: "include" }
        )

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data: unknown = await res.json()

        if (mounted && Array.isArray(data)) {
          setSectors(data as Sector[])
        }
      } catch (err) {
        console.error("Learning paths error:", err)
        if (mounted) setError("Unable to load learning paths")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchSectors()
    return () => {
      mounted = false
    }
  }, [])

  /* ------------------------------------------------------------------
   * Derived data
   * ------------------------------------------------------------------ */

  const filteredSectors = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sectors

    return sectors
      .map((sector) => {
        const matchingRoles = sector.roles.filter(
          (role) =>
            role.title.toLowerCase().includes(q) ||
            role.tags.join(" ").toLowerCase().includes(q)
        )

        if (
          sector.title.toLowerCase().includes(q) ||
          matchingRoles.length > 0
        ) {
          return { ...sector, roles: matchingRoles }
        }

        return null
      })
      .filter((s): s is Sector => s !== null)
  }, [query, sectors])

  /* ------------------------------------------------------------------
   * UI States
   * ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Loading learning paths…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-rose-600">
        {error}
      </div>
    )
  }

  if (filteredSectors.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-500">
        No learning paths available.
      </div>
    )
  }

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <div className="max-w-6xl mx-auto p-6">
      {!selectedSector ? (
        <>
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold">
                Career Learning Paths
              </h2>
              <p className="text-sm text-slate-500">
                Choose a sector to explore roles and learning resources
              </p>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles or skills"
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSectors.map((sector) => {
              const Icon =
                ICON_MAP[sector.icon ?? ""] ?? Cpu

              return (
                <button
                  key={sector.id}
                  onClick={() => {
                    setSelectedSector(sector)
                    setOpenRole(null)
                  }}
                  className="border rounded-2xl p-5 bg-white hover:shadow-lg text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-slate-700" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">
                        {sector.title}
                      </h3>
                      {sector.subtitle && (
                        <p className="text-xs text-slate-500">
                          {sector.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedSector(null)}
            className="mb-4 flex items-center gap-2 text-sm text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h2 className="text-2xl font-extrabold mb-4">
            {selectedSector.title}
          </h2>

          <div className="space-y-4">
            {selectedSector.roles.map((role) => {
              const open = openRole === role.id

              return (
                <div key={role.id} className="border rounded-2xl p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {role.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs border rounded-full px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setOpenRole(open ? null : role.id)
                      }
                      className="text-sm border px-3 py-1 rounded-md"
                    >
                      {open ? "Hide" : "View"}
                    </button>
                  </div>

                  {open && (
                    <div className="mt-4 grid sm:grid-cols-2 gap-2">
                      {role.resources.map((r) => (
                        <a
                          key={r.url}
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm"
                        >
                          <span className="truncate">{r.title}</span>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
