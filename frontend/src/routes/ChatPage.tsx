/**
 * ChatPage.tsx
 *
 * - On load: chat bar centered vertically
 * - After first message: bar moves to bottom, centered horizontally
 * - User messages: right
 * - Bot messages: left, transparent-style bubble
 * - Buttons have working behavior + tooltips
 */

import React, { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"

import { Plus, Send } from "lucide-react"
import particleGif from "/src/assets/GIF/animatedcircle.gif";

import deepResearchImg from "/src/assets/Logo/Deep_Research-removebg-preview.png";
import deepThinkingImg from "/src/assets/Logo/Deep_Thinking-removebg-preview.png";
import aiBrainImg from "/src/assets/Logo/AI_Brain-removebg-preview.png";
import studyLearnImg from "/src/assets/Logo/Study_and_Learn-removebg-preview.png";
import webSearchImg from "/src/assets/Logo/Web_search-removebg-preview.png";
import modelSelectImg from "/src/assets/Logo/Model_Selection-removebg-preview.png";


type ChatMessage = { from: "user" | "bot"; text: string }

type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
}

export default function ChatPage(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // ==============================
  // LOAD CHAT HISTORY (Chat Page)
  // ==============================
  useEffect(() => {
    fetch("http://localhost:5000/api/chat/history?page=chat", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: ChatSession[]) => {
        setChatHistory(data)
      })
      .catch(() => {
        console.error("Failed to load chat history")
      })
  }, [])


  // conversation context for the model (role/content pairs)
  

  // selected model for this chat (null = use server default)
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const hasMessages = messages.length > 0

  // ==============================
  // SAVE CHAT MESSAGE (Chat Page)
  // ==============================
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
          page: "chat",
          session_id: activeChatId,
          message: { from, text },
        }),
      })

      const data = await res.json()

      // First message creates session
      if (!activeChatId && data.session_id) {
        setActiveChatId(data.session_id)
      }
    } catch {
      console.error("Failed to save chat message")
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    // 1️⃣ add user message
    setMessages((prev) => [
      ...prev,
      { from: "user", text: userMessage },
    ]);
    await saveChatMessage("user", userMessage);

    try {
      const response = await fetch("http://localhost:5000/api/chatpage/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          file_id: activeFileId,
          mode: selectedModel ?? undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      // 2️⃣ add bot message ONLY after full reply
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.reply },
      ]);

      await saveChatMessage("bot", data.reply);

    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Server error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    
  }, [messages])

  const CodeRenderer = ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean
    className?: string
    children?: React.ReactNode
  } & Record<string, unknown>) => {
    const baseClass = inline ? "inline-code" : "block-code"
    const extra = className ? ` ${className}` : ""

    return (
      <code
        className={`${baseClass}${extra} rounded px-1 py-0.5`}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      >
        {String(children ?? "")}
      </code>
    )
  }
  // --- end paste ---

  return (
    <div className="h-full w-full bg-[#d4d9de] flex items-center justify-center">
      {/* Inner rounded black panel */}
      <div
        className="
          relative
          w-[95%] h-[90%]
          bg-black rounded-[40px]
          border border-[#222]
          overflow-hidden
          flex flex-col
        "
      >
        
        {/* ✅ HISTORY TOGGLE BUTTON */}
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

        {/* ✅ HISTORY DRAWER */}
        <div
          className={`absolute top-0 left-0 h-full w-[280px] bg-[#111] text-white border-r border-white/20 z-20 transition-transform duration-300 overflow-visible ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >

          <div className="p-4 flex flex-col h-full">
            <button
              onClick={() => {
                setMessages([])
                setActiveChatId(null)
                setDrawerOpen(false)
              }}
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
              onClick={() => {
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

        <img
          src={particleGif}
          alt="particle"
          className="
            absolute inset-0 m-auto
            w-[70%] max-w-[570px]
            aspect-square object-contain
            opacity-100
            pointer-events-none
            z-0
          "
        />

        {/* FOREGROUND: messages + bar */}
        <div className="relative z-10 flex flex-col w-full h-full">
          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-2 scrollbar-hide">
            {hasMessages && (
              <div className="flex justify-center">
                <div className="w-full md:w-[60%] max-w-3xl space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex w-full ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                          max-w-[80%] px-4 py-2 rounded-2xl text-sm md:text-base
                          ${
                            msg.from === "user"
                              ? "bg-blue-600 text-white"
                              : "bot-markdown bg-transparent text-white border border-white/30 backdrop-blur-sm"
                          }
                        `}
                      >    
                        {msg.from === "bot" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="font-semibold text-lg mt-4 mb-2">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="font-semibold text-base mt-3 mb-2">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="font-medium text-sm mt-3 mb-1">{children}</h3>
                              ),
                              p: ({ children }) => (
                                <p className="font-normal mb-2 leading-relaxed">{children}</p>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal ml-5 space-y-1">{children}</ol>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc ml-5 space-y-1">{children}</ul>
                              ),
                              li: ({ children }) => (
                                <li className="font-normal">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <span className="font-medium">{children}</span>
                              ),
                              code: (props) => (
                                <CodeRenderer
                                  {...(props as {
                                    inline?: boolean
                                    className?: string
                                    children?: React.ReactNode
                                  })}
                                />
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            {/* When NO messages → center the bar vertically */}
            {!hasMessages && (
              <div className="flex items-center justify-center h-full">
                <ChatBar
                  input={input}
                  setInput={setInput}
                  onSend={sendMessage}
                  loading={loading}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  setMessages={setMessages}          
                  setActiveFileId={setActiveFileId} 
                />
              </div>
            )}
          </div>

          {/* When messages exist → bar at bottom, centered */}
          {hasMessages && (
            <div className="px-4 pb-6 flex justify-center">
              <ChatBar
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                loading={loading}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                setMessages={setMessages}         
                setActiveFileId={setActiveFileId}  
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ChatBar — buttons + options all wired with tooltips.
 */
function ChatBar({
  input,
  setInput,
  onSend,
  loading,
  selectedModel,
  setSelectedModel,
  setMessages,
  setActiveFileId,
}: {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  selectedModel: string | null;
  setSelectedModel: (v: string | null) => void;

  // 🔥 ADD THESE
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
}) {

  // ---------------- MODE → BACKEND KEY MAP ----------------
  const MODE_KEY: Record<string, string> = {
    "Deep Research": "deep-research",
    "Deep Thinking": "deep-thinking",
    "AI Brain": "ai-brain",
    "Study & Learn": "study-learn",
    "Web Search": "web-search",
    "Model Select": "model-select",
  };

  const [lastUpload, setLastUpload] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modelPanelRef = useRef<HTMLDivElement | null>(null);
  const [showModelPanel, setShowModelPanel] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        showModelPanel &&
        modelPanelRef.current &&
        !modelPanelRef.current.contains(e.target as Node)
      ) {
        setShowModelPanel(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModelPanel]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLastUpload(file.name)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      // 🔥 THIS IS THE FIX
      setActiveFileId(data.file.id)


      // 🔥 CRITICAL FIX: tell chat that document is ready
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `Document "${file.name}" uploaded successfully. You can now ask questions about it.`,
        },
      ])

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Failed to upload document. Please try again.",
        },
      ])
    } finally {
      e.target.value = ""
    }
  }

  const MODEL_OPTIONS = [
    { name: "OpenAI GPT-4o" },
    { name: "OpenAI GPT-4.1" },
    { name: "Claude Opus" },
    { name: "Claude Sonnet" },
    { name: "Google Gemini 1.5" },
    { name: "Groq LLaMA 3" },
    { name: "Mistral Large" },
    { name: "Cohere Command R+" },
    { name: "Perplexity Pro" },
    { name: "xAI Grok" },
  ];

  return (
    <div
      className="
        w-full
        md:w-[60%]
        max-w-3xl
        bg-[#454545]
        rounded-2xl
        p-4
        border border-[#777]
        shadow-lg
      "
    >
      {/* hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top input row */}
      <div
        className="
          flex items-center
          bg-[#333]
          rounded-xl
          px-4 py-3
          border border-[#666]
          mb-3
        "
      >
        {/* Upload button */}
        <IconButton
          tooltip="Upload files"
          onClick={handleUploadClick}
          className="
            mr-3
            h-10 w-10
            flex items-center justify-center
            rounded-xl
            bg-transparent
            border border-white/40
            hover:bg-white/5
            transition
          "
        >
          <Plus className="h-5 w-5 text-white" />
        </IconButton>

        <textarea
          placeholder="Future Explore....."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          className="
            bg-transparent flex-1 outline-none text-base md:text-lg text-white
            resize-none overflow-hidden
          "
        />

        {/* Send button */}
        <IconButton
          tooltip="Send message"
          onClick={!loading ? onSend : undefined}
          className="
            ml-3
            h-10 w-10
            flex items-center justify-center
            rounded-xl
            bg-transparent
            border border-white/40
            hover:bg-white/5
            transition
          "
        >
          <Send className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      {/* Bottom icons row (toggle on/off) */}
      <div className="flex justify-between items-center px-2 mt-2">
        {/* ✅ LEFT SIDE (4 tools) */}
        <div className="flex gap-1">
          <ImageToggle
            src={deepResearchImg}
            label="Deep Research"
            active={selectedModel === MODE_KEY["Deep Research"]}
            onClick={() => {
              if (selectedModel === MODE_KEY["Deep Research"]) {
                setSelectedModel(null);
              } else {
                setSelectedModel(MODE_KEY["Deep Research"]);
              }
              setShowModelPanel(false);
            }}
          />

          <ImageToggle
            src={deepThinkingImg}
            label="Deep Thinking"
            active={selectedModel === MODE_KEY["Deep Thinking"]}
            onClick={() => {
              if (selectedModel === MODE_KEY["Deep Thinking"]) {
                setSelectedModel(null);
              } else {
                setSelectedModel(MODE_KEY["Deep Thinking"]);
              }
              setShowModelPanel(false);
            }}
          />

          <ImageToggle
            src={aiBrainImg}
            label="AI Brain"
            active={selectedModel === MODE_KEY["AI Brain"]}
            onClick={() => {
              if (selectedModel === MODE_KEY["AI Brain"]) {
                setSelectedModel(null);
              } else {
                setSelectedModel(MODE_KEY["AI Brain"]);
              }
              setShowModelPanel(false);
            }}
          />

          <ImageToggle
            src={studyLearnImg}
            label="Study & Learn"
            active={selectedModel === MODE_KEY["Study & Learn"]}
            onClick={() => {
              if (selectedModel === MODE_KEY["Study & Learn"]) {
                setSelectedModel(null);
              } else {
                setSelectedModel(MODE_KEY["Study & Learn"]);
              }
              setShowModelPanel(false);
            }}
          />
        </div>

        {/* ✅ RIGHT SIDE (2 tools) */}
        <div className="flex gap-1">
          <ImageToggle
            src={webSearchImg}
            label="Web Search"
            active={selectedModel === MODE_KEY["Web Search"]}
            onClick={() => {
              if (selectedModel === MODE_KEY["Web Search"]) {
                setSelectedModel(null);
              } else {
                setSelectedModel(MODE_KEY["Web Search"]);
              }
              setShowModelPanel(false);
            }}
          />

          <ImageToggle
            src={modelSelectImg}
            label="Model Select"
            active={selectedModel === MODE_KEY["Model Select"]}
            onClick={() => {
              if (selectedModel === MODE_KEY["Model Select"]) {
                setSelectedModel(null);
                setShowModelPanel(false);
              } else {
                setSelectedModel(MODE_KEY["Model Select"]);
                setShowModelPanel(true);
              }
            }}
          />
        </div>
      </div>

      {showModelPanel && (
        <div
          ref={modelPanelRef}
          className="mt-3 bg-[#222] border border-white/20 rounded-xl p-3"
        >
          <p className="text-xs text-blue-300 mb-2">Select one AI model:</p>

          <div className="grid grid-cols-2 gap-2">
            {MODEL_OPTIONS.map((model) => {
              const active = false;

              return (
                <button
                  key={model.name}
                  type="button"
                  onClick={() => {
                    setShowModelPanel(false);
                  }}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition text-left ${
                    active
                      ? "border-blue-400 bg-blue-400/20 text-blue-200"
                      : "border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {model.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Show last uploaded file name (optional, but useful feedback) */}
      {lastUpload && (
        <p className="mt-2 text-xs text-gray-300 px-1 truncate">
          Last upload: <span className="font-semibold">{lastUpload}</span>
        </p>
      )}
    </div>
  );
}


/**
 * Generic icon button with tooltip
 */
function IconButton({
  tooltip,
  onClick,
  className = "",
  children,
}: {
  tooltip: string
  onClick?: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative
        flex items-center justify-center
        h-10 w-10
        rounded-xl
        bg-transparent          /* <-- FIX: No white background */
        border-white/30       /* thin white border */
        hover:bg-white/10     /* small hover glow (optional) */
        appearance-none         /* remove browser default styles */
        p-0                     /* removes unwanted padding */
        ${className}
      `}
    >
      {children}

      {/* Tooltip */}
      <span
        className="
          pointer-events-none absolute
          -top-9 left-1/2 -translate-x-1/2
          whitespace-nowrap
          rounded-md bg-black/80 
          px-2 py-1 text-xs text-white
          opacity-0 group-hover:opacity-100 transition
        "
      >
        {tooltip}
      </span>
    </button>
  )
}


/**
 * Toggle icon button used for Search / Brain / Bot / Globe
 */
function ImageToggle({
  src,
  label,
  active,
  onClick,
}: {
  src: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative
        flex items-center justify-center
        h-14 w-14
        rounded-xl
        border transition
        ${
          active
            ? "border-blue-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
            : "border-white/30 hover:bg-white/5"
        }
      `}
    >
      <img src={src} alt={label} className="h-7 w-7 object-contain" />

      {/* ✅ Tooltip (shows only on hover) */}
      <span
        className="
          pointer-events-none absolute
          -top-9 left-1/2 -translate-x-1/2
          whitespace-nowrap
          rounded-md bg-black/80 
          px-2 py-1 text-xs text-white
          opacity-0 group-hover:opacity-100 transition
        "
      >
        {label}
      </span>
    </button>
  )
}
