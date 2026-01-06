// frontend/src/LearningPage/Notes_&_Flashcards/NotesFlashcards.tsx

import React, { useEffect, useMemo, useState } from "react"

/* ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------ */

type Note = {
  id: string
  title: string
  body?: string
}

/* ------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------ */
const API_BASE = ""

const NOTES_API =
  `${API_BASE}/api/v1/learning/github-projects/notes`

const STORAGE_KEY = "notes_flashcards_v3"

/* ------------------------------------------------------------------
 * Embedded fallback notes (guaranteed safe)
 * ------------------------------------------------------------------ */

const EMBEDDED_NOTES: Note[] = [
  {
    id: "1",
    title: "Bias vs Variance",
    body:
      "Bias: error from incorrect assumptions (underfitting). Variance: sensitivity to training data (overfitting).",
  },
  {
    id: "2",
    title: "Gradient Descent",
    body:
      "Iteratively updates parameters in the direction of the negative gradient. Learning rate controls step size.",
  },
  {
    id: "3",
    title: "Train / Validation / Test Split",
    body:
      "Train model on training set, tune hyperparameters on validation set, evaluate final model on test set.",
  },
]

/* ------------------------------------------------------------------
 * Main Component
 * ------------------------------------------------------------------ */

export default function NotesFlashcards(): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([])
  const [mode, setMode] = useState<"notes" | "flashcards">("notes")
  const [query, setQuery] = useState("")
  const [shuffled, setShuffled] = useState<Note[] | null>(null)
  const [loading, setLoading] = useState(true)

  /* ------------------------------------------------------------------
   * Load notes (Backend → LocalStorage → Embedded)
   * ------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true

    async function load() {
        try {
          const res = await fetch(NOTES_API)
          if (res.ok) {
            const data = await res.json()

            if (mounted) {
              if (Array.isArray(data)) {
                setNotes(data)
                setLoading(false)
                return
              }

              if (Array.isArray(data.notes)) {
                setNotes(data.notes)
                setLoading(false)
                return
              }
            }
          }
        } catch {
          /* backend unavailable */
        }

        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw && mounted) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
              setNotes(parsed)
              setLoading(false)
              return
            }
          }
        } catch (err) {
            console.warn("Backend unavailable", err)
          }

        if (mounted) {
          setNotes(EMBEDDED_NOTES)
          setLoading(false)
        }
      }

    load()
    return () => {
      mounted = false
    }
  }, [])

  /* ------------------------------------------------------------------
   * Persist locally
   * ------------------------------------------------------------------ */

  useEffect(() => {
    if (!notes.length) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    } catch {
      /* ignore */
    }
    setShuffled(null)
  }, [notes])

  /* ------------------------------------------------------------------
   * Derived data
   * ------------------------------------------------------------------ */

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter((n) =>
      `${n.title} ${n.body ?? ""}`.toLowerCase().includes(q)
    )
  }, [notes, query])

  /* ------------------------------------------------------------------
   * Backend-synced Actions
   * ------------------------------------------------------------------ */

  async function addNote() {
    try {
      const res = await fetch(NOTES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New note", body: "" }),
      })

      if (res.ok) {
        const note = await res.json()
        setNotes((prev) => [note, ...prev])
        return
      }
    } catch {
      /* fallback */
    }

    setNotes((prev) => [
      { id: String(Date.now()), title: "New note", body: "" },
      ...prev,
    ])
  }

  async function updateNote(updated: Note) {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    )

    try {
      await fetch(`${NOTES_API}/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
    } catch {
      /* ignore */
    }
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id))

    try {
      await fetch(`${NOTES_API}/${id}`, {
        method: "DELETE",
      })
    } catch {
      /* ignore */
    }
  }

  function shuffleCards() {
    const src = filteredNotes.length ? filteredNotes : notes
    const arr = [...src]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setShuffled(arr)
  }

  function resetToDefault() {
    setNotes(EMBEDDED_NOTES)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------------
   * Loading UI
   * ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Loading notes…
      </div>
    )
  }

  /* ------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------ */

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <header className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Notes & Flashcards
          </h3>
          <p className="text-sm text-slate-600">
            Study notes or practice with flashcards
          </p>
        </div>

        <div className="flex gap-2">
          <div className="inline-flex bg-slate-50 rounded-md p-1">
            <button
              onClick={() => setMode("notes")}
              className={`px-3 py-1 text-sm rounded ${
                mode === "notes" ? "bg-white shadow" : "hover:bg-slate-100"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setMode("flashcards")}
              className={`px-3 py-1 text-sm rounded ${
                mode === "flashcards"
                  ? "bg-white shadow"
                  : "hover:bg-slate-100"
              }`}
            >
              Flashcards
            </button>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="px-2 py-1 border rounded text-sm"
          />

          <button
            onClick={resetToDefault}
            className="px-3 py-1 border rounded text-sm bg-white"
          >
            Reset
          </button>
        </div>
      </header>

      {mode === "notes" && (
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-slate-600">Notes editor</span>
            <button
              onClick={addNote}
              className="px-3 py-1 border rounded text-sm bg-white"
            >
              + Add
            </button>
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-sm text-slate-500">No notes found.</div>
          )}

          <div className="space-y-3">
            {filteredNotes.map((n) => (
              <NoteEditor
                key={n.id}
                note={n}
                onSave={updateNote}
                onDelete={() => deleteNote(n.id)}
              />
            ))}
          </div>
        </div>
      )}

      {mode === "flashcards" && (
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm text-slate-600">
              Click a card to flip
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShuffled(null)}
                className="px-3 py-1 border rounded text-sm bg-white"
              >
                Reset
              </button>
              <button
                onClick={shuffleCards}
                className="px-3 py-1 border rounded text-sm bg-white"
              >
                Shuffle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(shuffled ?? filteredNotes).map((n) => (
              <FlashCard key={n.id} note={n} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------
 * Subcomponents
 * ------------------------------------------------------------------ */

function NoteEditor({
  note,
  onSave,
  onDelete,
}: {
  note: Note
  onSave: (n: Note) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body ?? "")
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setTitle(note.title)
    setBody(note.body ?? "")
  }, [note.id, note.title, note.body])

  function save() {
    onSave({
      ...note,
      title: title.trim() || "Untitled",
      body: body.trim(),
    })
    setEditing(false)
  }

  return (
    <div className="border rounded p-3 bg-slate-50">
      <div className="flex justify-between gap-3">
        <div className="flex-1">
          {editing ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm mb-2"
              />
              <textarea
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </>
          ) : (
            <>
              <div className="font-medium text-slate-900">{title}</div>
              <div className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                {body || <span className="text-slate-400">No content</span>}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {editing ? (
            <>
              <button onClick={save} className="px-2 py-1 border rounded text-sm bg-white">
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-2 py-1 border rounded text-sm bg-white"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-2 py-1 border rounded text-sm bg-white"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Delete this note?")) onDelete()
                }}
                className="px-2 py-1 border rounded text-sm bg-white text-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FlashCard({ note }: { note: Note }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [note.id])

  return (
    <button
      onClick={() => setFlipped((s) => !s)}
      className="w-full min-h-24 p-4 text-left rounded-2xl shadow-sm bg-white border"
      aria-pressed={flipped}
    >
      {!flipped ? (
        <>
          <div className="font-medium text-slate-900">{note.title}</div>
          <div className="text-sm text-slate-600 mt-2 line-clamp-3">
            {note.body ?? ""}
          </div>
        </>
      ) : (
        <>
          <div className="font-medium text-slate-900">Answer</div>
          <div className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
            {note.body ?? "(no content)"}
          </div>
        </>
      )}
    </button>
  )
}
