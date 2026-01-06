// frontend/src/api.ts

type ApiError = {
  message?: string
}

/**
 * Centralized API fetch helper
 *
 * RULES:
 * - url MUST start with `/api/...`
 * - VITE_API_BASE_URL must NOT include `/api`
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ""

  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED")
  }

  if (!res.ok) {
    let errorBody: ApiError | null = null

    try {
      errorBody = (await res.json()) as ApiError
    } catch {
      /* ignore non-JSON error */
    }

    throw new Error(
      errorBody?.message ??
        `API_ERROR ${res.status}`
    )
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}
