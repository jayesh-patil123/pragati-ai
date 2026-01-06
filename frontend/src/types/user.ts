export interface UserProfile {
  name: string
  email: string
}

export interface UpdateProfilePayload {
  name?: string
  email?: string
}
