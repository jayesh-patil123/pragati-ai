export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ActiveSession {
  id: string
  ip: string
  device: string
  lastActive: string
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  activeSessions: ActiveSession[]
}
