import { useEffect, useState, useCallback } from "react"
import { Star, Trash2, Plus, Search } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

/* ================= TYPES ================= */

interface Note {
  id: string
  title: string
  content: string
  starred: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

/* ================= COMPONENT ================= */

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  /* ---------- LOAD NOTES ---------- */
  const loadNotes = useCallback(async () => {
    setLoading(true)
    const res = await fetch("http://localhost:5000/api/v1/learning/notes/", {
      credentials: "include",
    })
    const data = await res.json()
    setNotes(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  /* ---------- CREATE NOTE ---------- */
  const createNote = async () => {
    const res = await fetch("http://localhost:5000/api/v1/learning/notes/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Note",
        content: "",
      }),
    })

    const note = await res.json()
    setNotes((prev) => [note, ...prev])
    setActiveNote(note)
  }

  /* ---------- UPDATE NOTE ---------- */
  const updateNote = async (updated: Note) => {
    setActiveNote(updated)
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    )

    await fetch(`http://localhost:5000/api/v1/learning/notes/${updated.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
  }

  /* ---------- DELETE NOTE ---------- */
  const deleteNote = async (id: string) => {
    await fetch(`http://localhost:5000/api/v1/learning/notes/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    setNotes((prev) => prev.filter((n) => n.id !== id))
    setActiveNote(null)
  }

  /* ---------- FILTER ---------- */
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  /* ================= UI ================= */

  return (
    <div className="h-full flex bg-[#eceff1] rounded-2xl overflow-hidden border">

      {/* SIDEBAR */}
      <aside className="w-72 bg-[#111] text-white flex flex-col border-r">

        <div className="p-4">
          <button
            onClick={createNote}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 py-2 rounded-lg"
          >
            <Plus size={16} /> New Note
          </button>
        </div>

        <div className="px-4 pb-2">
          <div className="flex items-center bg-black/40 rounded-lg px-3">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent outline-none px-2 py-2 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                activeNote?.id === note.id
                  ? "bg-blue-600"
                  : "hover:bg-white/10"
              }`}
            >
              <div className="flex justify-between">
                <span className="truncate">{note.title}</span>
                {note.starred && <Star size={14} className="text-yellow-400" />}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* EDITOR */}
      <main className="flex-1 flex flex-col">

        {loading && (
          <div className="p-3 text-sm text-gray-500 border-b">
            Loading notes…
          </div>
        )}

        {!activeNote && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select or create a note
          </div>
        )}

        {activeNote && (
          <>
            <div className="border-b px-6 py-3 flex justify-between">
              <input
                value={activeNote.title}
                onChange={(e) =>
                  updateNote({ ...activeNote, title: e.target.value })
                }
                className="text-xl font-semibold outline-none w-full bg-transparent"
              />

              <div className="flex gap-3 ml-4">
                <button
                  onClick={() =>
                    updateNote({
                      ...activeNote,
                      starred: !activeNote.starred,
                    })
                  }
                >
                  <Star
                    size={18}
                    className={
                      activeNote.starred
                        ? "fill-yellow-400 text-yellow-400"
                        : ""
                    }
                  />
                </button>

                <button onClick={() => deleteNote(activeNote.id)}>
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <textarea
                value={activeNote.content}
                onChange={(e) =>
                  updateNote({ ...activeNote, content: e.target.value })
                }
                className="w-1/2 p-4 font-mono text-sm outline-none resize-none border-r"
              />

              <div className="w-1/2 p-4 overflow-y-auto prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {activeNote.content}
                </ReactMarkdown>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
