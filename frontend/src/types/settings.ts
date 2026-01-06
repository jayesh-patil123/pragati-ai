// frontend/src/types/settings.ts

export interface AppSettings {
  general: {
    language: string
    timezone: string
    home: string
  }

  learning: {
    reminders: boolean
    recommendations: boolean
    sync: boolean
  }

  security: {
    two_factor: boolean
    active_sessions: number
    trusted_devices: number
  }

  appearance: {
    theme: string
    accent: string
    density: string
  }

  notifications: {
    email: boolean
    push: boolean
    digest: boolean
  }

  account: {
    username: string
    phone: string
  }

  ai: {
    agents_enabled: boolean
    personalization: boolean
    data_usage: boolean
  }
}
