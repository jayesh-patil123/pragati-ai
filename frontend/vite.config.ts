/**
 * vite.config.ts
 * Vite configuration for Pragati AI frontend.
 *
 * - Enables React plugin
 * - Enables Tailwind CSS v4 via "@tailwindcss/vite"
 * - Adds proxy to Flask backend for API + SSE streaming
 */

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [
    react(),       // React fast refresh, JSX transformation
    tailwindcss(), // Official Tailwind v4 plugin
  ],

  server: {
    port: 5173, // Frontend default port

    // ✅ IMPORTANT: Proxy all /api requests to Flask backend
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
