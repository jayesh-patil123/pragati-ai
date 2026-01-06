export interface AgentConfig {
  id: string
  name: string
  status: "active" | "paused" | "archived"
}
