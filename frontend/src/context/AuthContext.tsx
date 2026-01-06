/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

/* ================= TYPES ================= */

interface User {
  name: string
  email: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/* ================= CONTEXT ================= */

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

/* ================= PROVIDER ================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------- Load user on app start ---------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          credentials: "include",
        })

        if (res.status === 401) {
          setUser(null)
          return
        }

        if (!res.ok) {
          throw new Error("Failed to load user")
        }

        const data = await res.json()
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  /* ---------- Login ---------- */
  const login = async (email: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      throw new Error("Login failed")
    }

    const data = await res.json()
    setUser(data.user)
  }

  /* ---------- Logout ---------- */
  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ================= HOOK ================= */

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
