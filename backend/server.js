import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import crypto from "crypto"

const app = express()
app.use(cors())
app.use(bodyParser.json())

let chatSessions = []

// ---- GET ALL CHATS ----
app.get("/api/chats", (req, res) => {
  res.json(chatSessions)
})

// ---- POST MESSAGE ----
app.post("/api/chat", (req, res) => {
  const { message, chatId } = req.body

  let session = chatSessions.find((c) => c.id === chatId)

  if (!session) {
    session = {
      id: crypto.randomUUID(),
      title: message.slice(0, 30),
      messages: [],
      createdAt: Date.now(),
    }
    chatSessions.unshift(session)
  }

  session.messages.push({ from: "user", text: message })
  session.messages.push({ from: "bot", text: "AI Response: " + message })

  res.json({ session })
})

// ---- DELETE SINGLE CHAT ----
app.delete("/api/chats/:id", (req, res) => {
  chatSessions = chatSessions.filter((c) => c.id !== req.params.id)
  res.sendStatus(200)
})

// ---- CLEAR ALL ----
app.delete("/api/chats", (req, res) => {
  chatSessions = []
  res.sendStatus(200)
})

app.listen(5000, () => console.log("✅ Backend running on port 5000"))
