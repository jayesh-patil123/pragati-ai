// AI_tutor.tsx

import React, { useEffect, useRef, useState } from "react"
import {
  BookOpenCheck,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  X,
  Minus,
  Maximize2
} from "lucide-react"

type TutorSection = "learn" | "review" | "practice" | "tutor"

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  content: string
}

type ChatPosition = {
  x: number
  y: number
}

const MODE_LABELS: Record<TutorSection, string> = {
  learn: "Learn mode",
  review: "Review mode",
  practice: "Practice mode",
  tutor: "AI Tutor mode"
}

export default function AITutor(): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<TutorSection>("tutor")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [windowState, setWindowState] = useState<
    "normal" | "minimized" | "maximized"
  >("normal")

  // Initial chat position (bottom-right) using lazy initializer
  const [chatPosition, setChatPosition] = useState<ChatPosition>(() => {
    if (typeof window === "undefined") {
      return { x: 0, y: 0 }
    }
    const vw = window.innerWidth
    const vh = window.innerHeight
    return {
      x: vw - 460,
      y: vh - 420
    }
  })

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsThinking(true)

    // AI Tutor API (active backend)
    fetch("http://localhost:5000/api/ai-tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: trimmed,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API failed")
        return res.json()
      })
      .then((data) => {
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.answer,
        }

        setMessages((prev) => [...prev, aiMessage])
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            role: "assistant",
            content: "Server error. Please try again.",
          },
        ])
      })
      .finally(() => {
        setIsThinking(false)
      })
    }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const navButtonClasses = (section: TutorSection) =>
    `
      w-full text-left px-3 py-2 rounded-xl
      flex items-center gap-2
      text-xs
      transition-all duration-150
      ${
        activeSection === section
          ? "border border-slate-900 bg-slate-100 text-slate-900 shadow-sm"
          : "border border-transparent bg-transparent text-slate-700 hover:bg-slate-100"
      }
    `

  const handleOpenChat = () => {
    setIsChatOpen(true)
    setWindowState("normal")

    if (typeof window !== "undefined") {
      const vw = window.innerWidth
      const vh = window.innerHeight
      setChatPosition({
        x: vw - 460,
        y: vh - 420
      })
    }
  }

  const handleCloseChat = () => setIsChatOpen(false)

  const handleMinimizeChat = () => {
    setWindowState((prev) => {
        if (prev === "minimized") return "normal"
        return "minimized"
    })
  }

  const handleMaximizeChat = () => {
    setWindowState((prev) => (prev === "maximized" ? "normal" : "maximized"))
  }

  const handleDragStart: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (windowState === "maximized") return

    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const initialX = chatPosition.x
    const initialY = chatPosition.y

    const handleMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - startX
      const dy = event.clientY - startY

      setChatPosition({
        x: initialX + dx,
        y: initialY + dy
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="relative flex flex-col md:flex-row gap-6 h-full min-h-[300px]">
      {/* Left sidebar - compact */}
      <aside className="w-full md:w-52 shrink-0 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">AI Tutor</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Switch modes based on how you want to study.
          </p>
        </div>

        <div className="flex md:flex-col gap-2 md:gap-2.5">
          <button
            className={navButtonClasses("learn")}
            onClick={() => setActiveSection("learn")}
          >
            <BookOpenCheck className="h-4 w-4" />
            <span>Learn</span>
          </button>

          <button
            className={navButtonClasses("review")}
            onClick={() => setActiveSection("review")}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Review</span>
          </button>

          <button
            className={navButtonClasses("practice")}
            onClick={() => setActiveSection("practice")}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Practice</span>
          </button>

          <button
            className={navButtonClasses("tutor")}
            onClick={() => setActiveSection("tutor")}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Tutor</span>
          </button>
        </div>
      </aside>

      {/* Right side just acts as flexible space, no visible panel */}
      <main className="flex-1" />

      {/* BIG floating robot trigger */}
      <button
        type="button"
        onClick={handleOpenChat}
        className="
          absolute top-6 right-6
          h-24 w-24 md:h-28 md:w-28
          rounded-full border-2 border-slate-900 bg-white
          shadow-lg shadow-slate-900/15
          flex flex-col items-center justify-center
          hover:-translate-y-1 hover:shadow-xl
          transition-all duration-150
          z-50
        "
      >
        {/* Robot "arms" */}
        <div className="absolute -left-3 h-5 w-1.5 rounded-full bg-slate-900" />
        <div className="absolute -right-3 h-5 w-1.5 rounded-full bg-slate-900" />

        {/* Robot face */}
        <div className="flex gap-2 items-center">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
        </div>
        <div className="mt-1.5 h-0.5 w-8 rounded-full bg-slate-900" />

        {/* Mode badge */}
        <div className="absolute -top-2 -right-1 rounded-full bg-slate-900 text-[10px] text-white px-2 py-0.5">
          {activeSection === "tutor"
            ? "Tutor"
            : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </div>
      </button>

      {/* Chat popup (draggable) */}
      {isChatOpen && (
        <div
          className={`
            fixed z-50
            rounded-2xl shadow-2xl border border-slate-200 bg-white
            flex flex-col
            ${windowState === "maximized" ? "inset-3 md:inset-10" : ""}
          `}
          style={
            windowState === "maximized"
              ? {}
              : {
                  top: chatPosition.y,
                  left: chatPosition.x,
                  width: "min(100vw - 3rem, 420px)",
                  height: windowState === "minimized" ? "auto" : "360px"
                }
          }
        >
          {/* Header / drag handle */}
          <div
            className="
              cursor-move
              px-4 py-2.5
              flex items-center justify-between gap-2
              rounded-t-2xl border-b border-slate-100 bg-slate-900 text-white
            "
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-white text-slate-900 flex items-center justify-center text-[11px] font-semibold">
                AI
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold">
                  {MODE_LABELS[activeSection]}
                </span>
                <span className="text-[10px] text-slate-200">
                  Ask your question
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMinimizeChat()
                }}
                className="p-1 rounded-full hover:bg-slate-800"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMaximizeChat()
                }}
                className="p-1 rounded-full hover:bg-slate-800"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCloseChat()
                }}
                className="p-1 rounded-full hover:bg-slate-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Body */}
          {windowState !== "minimized" && (
            <div className="flex-1 flex flex-col px-4 py-3 min-h-[220px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2.5 text-xs md:text-sm pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex max-w-[90%] gap-2">
                      {msg.role === "assistant" && (
                        <div className="mt-0.5 h-5 w-5 rounded-full bg-slate-900 text-[9px] text-white flex items-center justify-center shrink-0">
                          AI
                        </div>
                      )}
                      <div
                        className={`
                          rounded-2xl px-3 py-1.5
                          whitespace-pre-wrap leading-relaxed
                          ${
                            msg.role === "user"
                              ? "bg-slate-900 text-white rounded-br-sm"
                              : "bg-slate-100 text-slate-900 rounded-bl-sm"
                          }
                        `}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start mt-1">
                    <div
                      className="
                        inline-flex items-center gap-1
                        rounded-full px-3 py-1.5
                        bg-slate-100 text-slate-700 border border-slate-200
                        text-[11px]
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.1s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="ml-1">Thinking…</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="
                      flex-1 text-xs md:text-sm
                      rounded-xl border border-slate-300
                      bg-white px-2.5 py-1.5
                      outline-none
                      focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900
                      resize-none
                    "
                    placeholder="Ask your question..."
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className={`
                      inline-flex items-center justify-center
                      px-3 py-1.5 rounded-full
                      text-xs font-medium
                      transition-all duration-150
                      ${
                        !input.trim() || isThinking
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-black"
                      }
                    `}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
