import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactElement } from "react"

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

/* ======================================================
 * TYPES
 * ====================================================== */

type VideoCard = {
  id: string
  youtube_id: string
  title: string
  description?: string
  embed_url: string
  video_url: string
  published_at?: string
  duration_minutes?: number
}

type SortMode = "latest" | "oldest" | "random"
type LengthFilter = "all" | "short" | "medium" | "long"

/* ======================================================
 * UTILITIES
 * ====================================================== */

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])

  return debounced
}

function useLockBodyScroll(lock: boolean): void {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = lock ? "hidden" : prev
    return () => {
      document.body.style.overflow = prev
    }
  }, [lock])
}

/* ======================================================
 * VIDEO MODAL
 * ====================================================== */

function VideoModal({
  video,
  onClose,
}: {
  video: VideoCard
  onClose: () => void
}): ReactElement {
  useLockBodyScroll(true)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const handler: EventListener = (event) => {
      const e = event as globalThis.KeyboardEvent
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handler)
    window.setTimeout(() => closeRef.current?.focus(), 30)

    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-slate-900 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 text-white">
          <span className="text-sm font-medium">{video.title}</span>
          <button
            ref={closeRef}
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 rounded text-sm"
          >
            Close
          </button>
        </div>
        <div className="relative" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`${video.embed_url}?autoplay=1&rel=0`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

/* ======================================================
 * MAIN COMPONENT
 * ====================================================== */

export default function YouTubeLectures(): ReactElement {
  const [videos, setVideos] = useState<VideoCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)

  const [sort, setSort] = useState<SortMode>("latest")
  const [length, setLength] = useState<LengthFilter>("all")

  const [openVideo, setOpenVideo] = useState<VideoCard | null>(null)

  const [highlight, setHighlight] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  /* ======================================================
   * CTRL + K GLOBAL SHORTCUT
   * ====================================================== */

  useEffect(() => {
    const handler: EventListener = (event) => {
      const e = event as globalThis.KeyboardEvent
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  /* ======================================================
   * FETCH
   * ====================================================== */

  async function fetchVideos(query = ""): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_BASE}/v1/learning/resources/youtube?search=${encodeURIComponent(
          query
        )}`
      )
      if (!res.ok) throw new Error()
      const json = await res.json()
      setVideos(json.items ?? [])
    } catch {
      setError("Unable to load learning videos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(debouncedSearch)
  }, [debouncedSearch])

  /* ======================================================
   * VISIBILITY AUTO REFRESH
   * ====================================================== */

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        fetchVideos(search)
      }
    }

    document.addEventListener("visibilitychange", handler)
    return () =>
      document.removeEventListener("visibilitychange", handler)
  }, [search])

  /* ======================================================
   * SUGGESTIONS (DEDUPED)
   * ====================================================== */

  const suggestions = useMemo(() => {
    if (!search) return []

    const seen = new Set<string>()
    const list: VideoCard[] = []

    for (const v of videos) {
      if (
        v.title.toLowerCase().includes(search.toLowerCase()) &&
        !seen.has(v.title)
      ) {
        seen.add(v.title)
        list.push(v)
      }
      if (list.length >= 6) break
    }

    return list
  }, [search, videos])

  /* ======================================================
   * INPUT KEYBOARD HANDLING (REACT)
   * ====================================================== */

  function onInputKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ): void {
    if (!suggestions.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight(i => (i + 1) % suggestions.length)
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight(i =>
        i <= 0 ? suggestions.length - 1 : i - 1
      )
    }

    if (e.key === "Enter") {
      e.preventDefault()
      const q =
        highlight >= 0 ? suggestions[highlight].title : search
      setSearch(q)
      setHighlight(-1)
      fetchVideos(q)
    }

    if (e.key === "Escape") {
      setHighlight(-1)
    }
  }

  /* ======================================================
   * FILTER + SORT
   * ====================================================== */

  const filtered = useMemo(() => {
    let list = [...videos]

    if (length !== "all") {
      list = list.filter(v => {
        const d = v.duration_minutes ?? 0
        if (length === "short") return d < 20
        if (length === "medium") return d >= 20 && d <= 60
        return d > 60
      })
    }

    if (sort === "random") return list.sort(() => Math.random() - 0.5)

    return list.sort((a, b) => {
      const da = new Date(a.published_at ?? 0).getTime()
      const db = new Date(b.published_at ?? 0).getTime()
      return sort === "latest" ? db - da : da - db
    })
  }, [videos, sort, length])

  /* ======================================================
   * RENDER
   * ====================================================== */

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        YouTube Lectures – Learning Only
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-60">
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search learning videos (Ctrl+K)…"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded shadow">
              {suggestions.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch(s.title)
                      fetchVideos(s.title)
                      setHighlight(-1)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      i === highlight
                        ? "bg-slate-200"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortMode)}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="random">Random</option>
        </select>

        <select
          value={length}
          onChange={e => setLength(e.target.value as LengthFilter)}
          className="border rounded-md px-2 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>

      {loading && <div className="p-4 text-sm">Loading…</div>}
      {error && <div className="p-4 text-sm text-red-600">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => (
          <button
            key={v.id}
            onClick={() => setOpenVideo(v)}
            className="border rounded-lg p-3 bg-white text-left shadow-sm"
          >
            <img
              src={`https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`}
              className="w-full aspect-video rounded-md"
              alt={v.title}
            />
            <h4 className="mt-2 text-sm font-semibold">{v.title}</h4>
            {v.description && (
              <p className="text-xs text-slate-600 mt-1">
                {v.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {openVideo && (
        <VideoModal
          video={openVideo}
          onClose={() => setOpenVideo(null)}
        />
      )}
    </div>
  )
}
