/**
 * HomePage.tsx
 *
 * - Before any messages:
 *    • Hero text visible
 *    • Chat bar roughly centered (like a search bar)
 * - After first message:
 *    • Hero text hidden
 *    • Chat area with bubbles
 *    • Chat bar sticks to the bottom
 * - User messages: right
 * - Bot messages: left
 */

/**
 * HomePage.tsx
 */

import React, { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"


/* ---------------- TYPES ---------------- */
type ChatMessage = { from: "user" | "bot"; text: string }

type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
}

type TypewriterLineProps = {
  text: string
  speed?: number
}

/* ---------------- TYPEWRITER ---------------- */
const TypewriterLine: React.FC<TypewriterLineProps> = ({ text, speed = 70 }) => {
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current)

    intervalRef.current = window.setInterval(() => {
      setIndex((prev) => {
        if (prev >= text.length) {
          if (intervalRef.current !== null) clearInterval(intervalRef.current)
          return prev
        }
        return prev + 1
      })
    }, speed)

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current)
    }
  }, [text, speed])

  return <span style={{ whiteSpace: "pre" }}>{text.slice(0, index)}</span>
}



/* ---------------- MAIN ---------------- */
export default function HomePage(): React.JSX.Element {

  //  1. STATE (correct)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  //  2. REFS (correct)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const hasMessages = messages.length > 0

  //  3. EFFECTS (THIS IS EXACTLY WHERE IT BELONGS)
  useEffect(() => {
    fetch("http://localhost:5000/api/chat/history?page=home", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: ChatSession[]) => {
        const unique = Array.from(
          new Map(data.map((c) => [c.id, c])).values()
        )
        setChatHistory(unique)
      })
      .catch(() => {
        console.error("Failed to load chat history")
      })
  }, [])

  /* -------- SAVE CHAT MESSAGE -------- */
  const saveChatMessage = async (
    from: "user" | "bot",
    text: string
  ) => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "home",
          session_id: activeChatId,
          message: { from, text },
        }),
      })

      const data = await res.json()

      // first message creates session
      if (!activeChatId && data.session_id) {
        setActiveChatId(data.session_id)

        // 🔁 refresh chat history so it appears in drawer
        fetch("http://localhost:5000/api/chat/history?page=home", {
          credentials: "include",
        })
          .then((res) => res.json())
          .then((h: ChatSession[]) => {
            const unique = Array.from(
              new Map(h.map((c) => [c.id, c])).values()
            )
            setChatHistory(unique)
          })
      }
    } catch {
      console.error("Failed to save chat message")
    }
  }

  /* -------- DELETE ALL CHAT HISTORY -------- */
  const deleteAllHistory = async () => {
    try {
      await fetch("http://localhost:5000/api/chat/history?page=home", {
        method: "DELETE",
        credentials: "include",
      })
    } catch {
      console.error("Failed to delete history")
    }
  }

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input

    const userMsg: ChatMessage = {
      from: "user",
      text: userMessage,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    /* save USER message */
    await saveChatMessage("user", userMessage)

    try {
      const response = await fetch("http://localhost:5000/api/home/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch response")
      }

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: data.reply,
        },
      ])

      /* save BOT message */
      await saveChatMessage("bot", data.reply)

    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Server error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setActiveChatId(null)
    setDrawerOpen(false)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  // <<< INSERT CODE RENDERER HERE >>>
  /* ---------------- CODE RENDERER (TYPED) ---------------- */
  const CodeRenderer: Components["code"] = ({
    className,
    children,
    ...props
  }) => {
    const isBlock = Boolean(className)
    const baseClass = isBlock ? "block-code" : "inline-code"
    const extra = className ? ` ${className}` : ""

    return (
      <code
        className={`${baseClass}${extra} rounded px-1 py-0.5`}
        {...props}
      >
        {String(children ?? "")}
      </code>
    )
  }
  // <<< END INSERT >>>

  return (
    <div className="h-full w-full bg-[#d4d9de] flex items-center justify-center">
      <div className="w-[95%] h-[90%] bg-[#eceff1] rounded-[40px] border border-[#222] overflow-hidden relative flex flex-col">

        {/* ✅ SAME GIF */}
        <img
          src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z294Y3pzdGhjNDJmY3JtcWluYnZveGh0Z3lkZDVtM3EyaWpkaHpudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/wQOWdWdmwYnVS/giphy.gif"
          className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
        />

        {/* ✅ DRAWER BUTTON */}
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="
            absolute top-4 left-4 z-30
            h-10 w-10
            rounded-lg
            bg-black/70 text-white
            flex items-center justify-center

            border border-white/10

            outline-none
            focus:outline-none
            focus:ring-1
            focus:ring-white/10
            active:ring-1
            active:ring-white/30
          "
        >
          ☰
        </button>

        {/* ✅ DRAWER */}
        <div
          className={`absolute top-0 left-0 h-full w-[280px] bg-[#111] text-white border-r border-white/20 z-20 transition-transform duration-300 overflow-visible ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >

          <div className="p-4 flex flex-col h-full">
            <button
              onClick={startNewChat}
              className="mb-3 w-full py-2 rounded-lg bg-blue-600 text-white"
            >
              + New Chat
            </button>

            <input
              placeholder="Search chat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3 px-3 py-2 rounded-lg bg-black/40 border border-white/20 outline-none text-sm"
            />

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
              {chatHistory
                .filter((c) =>
                  c.title.toLowerCase().includes(search.toLowerCase())
                )
                .map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id)
                      setMessages(chat.messages)
                      setDrawerOpen(false)
                    }}
                    data-fulltext={chat.title}
                    className={`
                      chat-tooltip
                      w-full text-left px-3 py-2 rounded-lg text-sm
                      overflow-visible truncate
                      ${chat.id === activeChatId
                        ? "bg-blue-600"
                        : "bg-white/10 hover:bg-white/20"
                      }
                    `}
                  >
                    {chat.title}
                  </button>
                ))}
            </div>

            <button
              onClick={async () => {
                await deleteAllHistory()
                setChatHistory([])
                setMessages([])
                setActiveChatId(null)
              }}
              className="mt-4 py-2 bg-red-700 rounded text-sm"
            >
              Clear All History
            </button>
          </div>
        </div>

        {/* ✅ ORIGINAL UI UNCHANGED */}
        <div className="relative z-10 flex flex-col w-full h-full">
          <div className="flex-1 w-full overflow-y-auto px-6 pt-8 pb-4 scrollbar-hide">
            {!hasMessages && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">

                {/* ✅ Stable Line 1 */}
                <p className="text-3xl md:text-4xl font-semibold text-white mb-2">
                  Life is Better with
                </p>

                {/* ✅ Neon Glow Line 2 */}
                <p
                  className="
                    text-4xl md:text-5xl font-extrabold mb-3 tracking-wide
                    bg-linear-to-r from-sky-400 via-fuchsia-500 to-indigo-500
                    bg-clip-text text-transparent
                    leading-tight
                  "
                  style={{
                    textShadow: "0 0 18px rgba(99,102,241,0.35)",
                  }}
                >
                  Artificial Intelligence
                </p>

                {/* ✅ Typewriter Line 3 */}
                <p className="text-5xl md:text-6xl font-bold mt-2 text-pink-500">
                  <TypewriterLine text="Future Behind You" />
                </p>

                {/* ✅ Chat Bar */}
                <div className="w-full flex justify-center mt-8">
                  <ChatBar
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    loading={loading}
                  />
                </div>

              </div>
            )}

            {hasMessages && (
              <div className="max-w-2xl mx-auto space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex w-full ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      // container styling for bubble
                      className={`max-w-[80%] px-4 py-2 rounded-2xl wrap-break-words overflow-hidden ${
                        msg.from === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-black/40 text-white border border-white/30 backdrop-blur-sm"
                      }`}
                    >
                      {msg.from === "bot" ? (
                        <div className="bot-markdown wrap-break-words overflow-hidden">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              code: CodeRenderer,
                              p: ({ children }) => (
                                <p className="mb-3 leading-relaxed">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-relaxed">{children}</li>
                              ),
                              h3: ({ children }) => (
                                <h3 className="font-semibold text-lg mt-4 mb-2">{children}</h3>
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {hasMessages && (
            <div className="w-full flex justify-center pb-6 px-4">
              <ChatBar input={input} setInput={setInput} onSend={handleSend} loading={loading} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- CHAT BAR ---------------- */
function ChatBar({
  input,
  setInput,
  onSend,
  loading,
}: {
  input: string
  setInput: (v: string) => void
  onSend: () => void
  loading: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  return (
    <div className="w-full max-w-xl md:max-w-2xl flex items-center px-4 py-2.5 bg-[#d0d3d4]/80 rounded-xl border border-[#555] shadow-sm">
      <textarea
        ref={textareaRef}
        placeholder="Future Explore....."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onInput={(e) => {
          const el = e.currentTarget
          el.style.height = "auto"
          el.style.height = Math.min(el.scrollHeight, 160) + "px"
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        rows={1}
        className="
          bg-transparent flex-1 outline-none text-base md:text-lg text-[#111]
          resize-none overflow-y-auto
        "
      />


      <button
        type="button"
        onClick={onSend}
        disabled={loading}
        className="
          ml-3 h-9 w-10 rounded-lg
          bg-black/70 text-white
          border border-white/30
          hover:bg-black/80
          transition
          flex items-center justify-center
        "
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
