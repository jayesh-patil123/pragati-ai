/**
 * LoginPage.tsx
 *
 * Features:
 * - Sign In / Sign Up
 * - Password & OTP authentication
 * - Google / GitHub / LinkedIn OAuth
 * - Motion-enhanced UX (Framer Motion v10 safe)
 * - Fully accessible & production-ready
 */

import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Lock,
  Key,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  User,
  Phone,
  Github,
  Linkedin,
} from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useAuth } from "../context/useAuth"

/* ----------------------------------------
   Types
---------------------------------------- */
type AuthMode = "signin" | "signup"
type LoginMethod = "password" | "otp"

/* ----------------------------------------
   Motion Presets (Framer Motion v10 SAFE)
---------------------------------------- */
const cardMotion = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { stiffness: 140, damping: 18 },
  },
}

const fieldMotion = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { stiffness: 180, damping: 20 },
  },
  exit: { opacity: 0, y: -16 },
}

const shakeMotion = {
  animate: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.35 },
  },
}

/* ----------------------------------------
   Reusable Input Style
---------------------------------------- */
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-10 " +
  "text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"

/* ----------------------------------------
   Component
---------------------------------------- */
export default function LoginPage(): React.JSX.Element {
  const navigate = useNavigate()
  const { login } = useAuth()

  /* ---------- UI State ---------- */
  const [authMode, setAuthMode] = useState<AuthMode>("signin")
  const [method, setMethod] = useState<LoginMethod>("password")

  /* ---------- Form State ---------- */
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  /* ---------- UI Helpers ---------- */
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const otpRef = useRef<HTMLInputElement | null>(null)

  /* ----------------------------------------
     Effects
  ---------------------------------------- */
  useEffect(() => {
    if (method === "otp" && otpSent) otpRef.current?.focus()
  }, [method, otpSent])

  /* ----------------------------------------
   Auth Logic
  ---------------------------------------- */
  const handlePasswordLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate("/", { replace: true })
    } catch {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------------
    Password Signup (NEW)
  ---------------------------------------- */
  const handlePasswordSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Signup failed")
      }

      navigate("/", { replace: true })
      window.location.reload()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Signup failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async () => {
    if (!email) {
      setError("Email is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setOtpSent(true)
    } catch {
      setError("Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      })
      if (!res.ok) throw new Error()
      navigate("/", { replace: true })
      window.location.reload()
    } catch {
      setError("Invalid or expired OTP")
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------------
     Form Submit
  ---------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Signup password validation
    if (authMode === "signup" && method === "password") {
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
    }

    if (method === "password") {
      if (authMode === "signup") {
        await handlePasswordSignup()
      } else {
        await handlePasswordLogin()
      }
      return
    }


    if (!otpSent) {
      await requestOtp()
      return
    }

    await verifyOtp()
  }

  /* ----------------------------------------
     OAuth Redirects
  ---------------------------------------- */
  const oauth = {
    google: () =>
      (window.location.href = "http://localhost:5000/api/auth/google"),
    github: () =>
      (window.location.href = "http://localhost:5000/api/auth/github"),
    linkedin: () =>
      (window.location.href = "http://localhost:5000/api/auth/linkedin"),
  }

  /* ----------------------------------------
     Render
  ---------------------------------------- */
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-indigo-950 via-slate-950 to-fuchsia-950 px-4 text-white">
      <motion.div
        initial={cardMotion.initial}
        animate={cardMotion.animate}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-2xl"
      >
        {/* Sign In / Sign Up Toggle */}
        <div className="mb-6 flex rounded-xl bg-white/5 p-1">
          {(["signin", "signup"] as AuthMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setAuthMode(mode)
                setError(null)
                setPassword("")
                setConfirmPassword("")
              }}
              className={`flex-1 rounded-lg py-2 text-sm transition ${
                authMode === mode
                  ? "bg-indigo-600"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Password / OTP Selector */}
        <div className="mb-6 flex rounded-2xl border border-white/20 bg-white/5 p-1">
          {(["password", "otp"] as LoginMethod[]).map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setMethod(m)
                setOtpSent(false)
                setOtp("")
                setError(null)
              }}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all ${
                method === m
                  ? "bg-indigo-600 shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {m === "password" ? "Password" : "OTP"}
            </motion.button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {authMode === "signup" && (
              <>
                <motion.div {...fieldMotion} className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </motion.div>

                <motion.div {...fieldMotion} className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Password Login */}
          {method === "password" && (
            <>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {authMode === "signup" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((v) => !v)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* OTP */}
          {method === "otp" && otpSent && (
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={otpRef}
                maxLength={4}
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="••••"
                className={`${inputClass} text-center tracking-[0.6em]`}
              />
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                {...shakeMotion}
                className="text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {authMode === "signup"
                  ? "Create Account"
                  : method === "password"
                  ? "Sign In"
                  : otpSent
                  ? "Verify OTP"
                  : "Send OTP"}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* OAuth */}
        <div className="mt-6 flex justify-center gap-8">
          <motion.button
            whileHover={{ rotate: -8, scale: 1.15 }}
            className="rounded-full border-2 border-white/30 bg-white p-4 shadow-lg"
            onClick={oauth.google}
          >
            <FcGoogle size={28} />
          </motion.button>

          <motion.button
            whileHover={{ rotate: 8, scale: 1.15 }}
            className="rounded-full border-2 border-white/30 bg-slate-800 p-4"
            onClick={oauth.github}
          >
            <Github size={24} />
          </motion.button>

          <motion.button
            whileHover={{ y: -6, scale: 1.15 }}
            className="rounded-full border-2 border-white/30 bg-blue-700 p-4"
            onClick={oauth.linkedin}
          >
            <Linkedin size={24} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
