import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppShell from "./components/layout/AppShell"
import HomePage from "./routes/HomePage"
import ChatPage from "./routes/ChatPage"
import AgentsPage from "./routes/AgentsPage"
import LearningPage from "./routes/LearningPage"
import CoursesPage from "./routes/CoursesPage"
import UserPage from "./routes/UserPage"
import SettingsPage from "./routes/SettingsPage"
import LoginPage from "./routes/LoginPage"
import ProtectedRoute from "./components/ProtectedRoute"
import FilesPage from "./routes/FilesPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
