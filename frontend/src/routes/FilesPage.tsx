// frontend/src/routes/FilesPage.tsx

import { Upload, FileText, Trash2, Search, X } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import type { JSX } from "react"

type FileItem = {
  id: string
  name: string
  type: string
  uploadedAt: string
  status: "uploaded" | "processing" | "indexed"
}

type PageText = {
  page: number
  text: string
}

export default function FilesPage(): JSX.Element {
  const [search, setSearch] = useState("")
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 Viewer state (NEW)
  const [activeFile, setActiveFile] = useState<FileItem | null>(null)
  const [pages, setPages] = useState<PageText[]>([])
  const [textLoading, setTextLoading] = useState(false)
  const [textError, setTextError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ==============================
  // LOAD FILES FROM BACKEND
  // ==============================
  const loadFiles = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/files", {
        credentials: "include",
      })
      const data = await res.json()
      setFiles(data.files || [])
    } catch {
      console.error("Failed to load files")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  )

  // ==============================
  // UPLOAD FILE
  // ==============================
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)

    try {
      await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      await loadFiles()
    } catch {
      console.error("File upload failed")
    } finally {
      e.target.value = ""
    }
  }

  // ==============================
  // DELETE FILE
  // ==============================
  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/files/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      setFiles((prev) => prev.filter((file) => file.id !== id))
    } catch {
      console.error("Failed to delete file")
    }
  }

  // ==============================
  // LOAD EXTRACTED TEXT (NEW)
  // ==============================
  const openTextViewer = async (file: FileItem) => {
    setActiveFile(file)
    setTextLoading(true)
    setTextError(null)
    setPages([])

    try {
      const res = await fetch(
        `http://localhost:5000/api/files/${file.id}/text`,
        { credentials: "include" }
      )

      if (!res.ok) {
        throw new Error("Failed to load extracted text")
      }

      const data = await res.json()
      setPages(data.pages || [])
    } catch (err: any) {
      setTextError(err.message)
    } finally {
      setTextLoading(false)
    }
  }

  const closeViewer = () => {
    setActiveFile(null)
    setPages([])
    setTextError(null)
  }

  return (
    <div className="h-full w-full flex bg-slate-100">
      {/* ==============================
          LEFT: FILE LIST
         ============================== */}
      <div className="flex-1 flex items-center justify-center px-3 md:px-6 py-4">
        <div className="w-full max-w-6xl h-full bg-white rounded-[28px] border border-slate-200 shadow-[0_0_40px_rgba(15,23,42,0.12)] flex flex-col overflow-hidden">
          {/* Header */}
          <header className="px-6 py-4 border-b bg-slate-50 flex justify-between">
            <div>
              <h1 className="text-lg font-semibold">Files</h1>
              <p className="text-xs text-slate-600">
                Upload and manage documents used for AI
              </p>
            </div>

            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border bg-white text-xs"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-9 pr-4 py-1.5 rounded-full border text-xs"
              />
            </div>

            {loading ? (
              <p className="text-xs">Loading files…</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border rounded-2xl p-4 flex justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {file.uploadedAt} · {file.status}
                      </p>

                      {/* ✅ VIEW TEXT */}
                      <button
                        onClick={() => openTextViewer(file)}
                        className="mt-1 text-[11px] underline text-slate-600 hover:text-slate-900"
                      >
                        View extracted text
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==============================
          RIGHT: TEXT VIEWER PANEL (NEW)
         ============================== */}
      {activeFile && (
        <div className="w-[420px] bg-white border-l shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <div>
              <p className="text-sm font-semibold truncate max-w-[280px]">
                {activeFile.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Extracted text
              </p>
            </div>
            <button onClick={closeViewer}>
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {textLoading && (
              <p className="text-xs text-slate-500">
                Loading document…
              </p>
            )}

            {textError && (
              <p className="text-xs text-red-600">{textError}</p>
            )}

            {pages.map((p) => (
              <div key={p.page}>
                <h4 className="text-xs font-semibold text-slate-600 mb-1">
                  Page {p.page}
                </h4>
                <pre className="whitespace-pre-wrap text-[12px] bg-slate-50 border rounded p-3">
                  {p.text || "(No text detected)"}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
