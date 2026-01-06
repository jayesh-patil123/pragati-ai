// frontend/src/LearningPage/Learning_Resources/Documents.tsx

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  FileText,
  Download,
  Trash2,
  Search,
  Plus,
  BookOpen,
  Eye,
  X,
  Tag,
  Database,
} from "lucide-react"

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api"

/* ------------------------------------------------------------------
 * Backend Types (Exact)
 * ------------------------------------------------------------------ */

type BackendDocument = {
  id: string
  title: string
  description?: string
  category: string
  level: string
  format: string
  pages?: number
  provider?: string
  url: string
  tags?: string[]
  related_course_ids?: string[]
}

/* ------------------------------------------------------------------
 * UI Document Type
 * ------------------------------------------------------------------ */

type DocumentItem = {
  id: string
  title: string
  description?: string
  url: string
  category: string
  level: string
  pages?: number
  provider?: string
  tags: string[]
  relatedCourses?: string[]
  uploaded?: boolean
}

/* ------------------------------------------------------------------
 * PDF Preview Modal
 * ------------------------------------------------------------------ */

function PdfPreview({
  doc,
  onClose,
}: {
  doc: DocumentItem
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white w-[90vw] h-[90vh] rounded-xl overflow-hidden flex flex-col">
        <header className="flex justify-between items-center p-3 border-b">
          <span className="text-sm font-medium">{doc.title}</span>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </header>

        <iframe
          src={doc.url}
          title={doc.title}
          className="flex-1 w-full"
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 * Documents Component
 * ------------------------------------------------------------------ */

export default function Documents(): React.JSX.Element {
  const [serverDocs, setServerDocs] = useState<DocumentItem[]>([])
  const [userDocs, setUserDocs] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)
  const [ragDocs, setRagDocs] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  /* ------------------------------------------------------------------
   * Fetch Documents (Backend structure FIXED)
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true

    async function fetchDocuments() {
      try {
        const res = await fetch(
          `${API_BASE}/v1/learning/resources/documents`,
          { credentials: "include" }
        )

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const json = await res.json()

        const backendItems: BackendDocument[] =
          Array.isArray(json?.items?.items)
            ? json.items.items
            : []

        const mapped: DocumentItem[] = backendItems.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          url: d.url,
          category: d.category,
          level: d.level,
          pages: d.pages,
          provider: d.provider,
          tags: d.tags ?? [],
          relatedCourses: d.related_course_ids ?? [],
        }))

        if (mounted) setServerDocs(mapped)
      } catch (err) {
        console.error(err)
        if (mounted) setError("Unable to load documents")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDocuments()
    return () => {
      mounted = false
    }
  }, [])

  /* ------------------------------------------------------------------
   * Derived State
   * ------------------------------------------------------------------ */

  const allDocs = useMemo(
    () => [...userDocs, ...serverDocs],
    [userDocs, serverDocs]
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    allDocs.forEach((d) => d.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [allDocs])

  const filteredDocs = useMemo(() => {
    const q = search.toLowerCase().trim()

    return allDocs.filter((d) => {
      if (activeTag && !d.tags.includes(activeTag)) return false

      return (
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.level.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [allDocs, search, activeTag])

  const groupedDocs = useMemo(() => {
    const groups: Record<string, DocumentItem[]> = {}
    filteredDocs.forEach((doc) => {
      if (!groups[doc.category]) groups[doc.category] = []
      groups[doc.category].push(doc)
    })
    return groups
  }, [filteredDocs])

  /* ------------------------------------------------------------------
   * Upload Handling (Client-side only)
   * ------------------------------------------------------------------ */

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const uploads: DocumentItem[] = []

    Array.from(files).forEach((file, index) => {
      if (!file.type.includes("pdf")) return

      uploads.push({
        id: `user-${Date.now()}-${index}`,
        title: file.name,
        url: URL.createObjectURL(file),
        category: "Your Uploads",
        level: "Personal",
        tags: [],
        uploaded: true,
      })
    })

    if (uploads.length) {
      setUserDocs((prev) => [...uploads, ...prev])
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleRag = (id: string) => {
    setRagDocs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  /* ------------------------------------------------------------------
   * UI States
   * ------------------------------------------------------------------ */

  if (loading) {
    return <div className="p-4 text-sm text-slate-600">Loading documents…</div>
  }

  if (error) {
    return <div className="p-4 text-sm text-rose-600">{error}</div>
  }

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <div className="space-y-6 p-4">
      {/* Search + Upload */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-slate-900 text-black px-3 py-2 rounded-md text-sm"
        >
          <Plus className="h-4 w-4" />
          Upload PDF
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setActiveTag(activeTag === tag ? null : tag)
              }
              className={`px-2 py-1 rounded text-xs border ${
                activeTag === tag
                  ? "bg-slate-900 text-black"
                  : "bg-white"
              }`}
            >
              <Tag className="inline h-3 w-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Documents */}
      {Object.entries(groupedDocs).map(([category, docs]) => (
        <section key={category} className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4" />
            {category}
          </h3>

          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center border rounded-md p-3 hover:bg-slate-50"
            >
              <div className="flex gap-3 items-start">
                <FileText className="h-5 w-5 text-slate-600 mt-0.5" />

                <div>
                  <div className="font-medium text-sm">{doc.title}</div>
                  <div className="text-xs text-slate-500">
                    {doc.level}
                    {doc.pages && ` • ${doc.pages} pages`}
                    {doc.provider && ` • ${doc.provider}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setPreviewDoc(doc)}>
                  <Eye className="h-4 w-4" />
                </button>

                <button onClick={() => toggleRag(doc.id)}>
                  <Database
                    className={`h-4 w-4 ${
                      ragDocs.has(doc.id)
                        ? "text-emerald-600"
                        : ""
                    }`}
                  />
                </button>

                <a href={doc.url} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                </a>

                {doc.uploaded && (
                  <button
                    onClick={() =>
                      setUserDocs((prev) =>
                        prev.filter((d) => d.id !== doc.id)
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      ))}

      {/* Preview Modal */}
      {previewDoc && (
        <PdfPreview
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
