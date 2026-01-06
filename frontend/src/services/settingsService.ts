import apiClient from "./apiClient"
import type { AppSettings } from "../types/settings"

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get<AppSettings>("/settings")
  return data
}
