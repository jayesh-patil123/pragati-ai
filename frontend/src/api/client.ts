// frontend/src/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function apiRequest<TResponse = unknown, TBody = unknown>(path: string, opts?: { method?: string; body?: TBody }) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: opts?.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as TResponse;
}
