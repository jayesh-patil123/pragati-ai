// AppShell.tsx
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function AppShell() {
  return (
    <div className="h-screen w-screen bg-slate-200 p-0.5">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="h-full mr-0.5">
          <Sidebar />
        </div>

        {/* Main content */}
        <main
          className="
            flex-1
            h-full
            rounded-[48px]
            border border-slate-400
            bg-slate-100
            overflow-hidden
          "
        >
          {/* 🔥 THIS IS THE FIX */}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
