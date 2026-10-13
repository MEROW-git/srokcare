export type UserRole = 'CITIZEN' | 'ADMIN'

export interface User {
  id: string
  nickname: string
  email: string
  role: UserRole
  createdAt?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
}

export interface PublicProfile {
  nickname: string
  role: UserRole
  createdAt: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  totalReports: number
  resolvedReports: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface MfaChallengeResponse {
  mfaRequired: true
  challengeToken: string
}

export interface MfaSetupResponse {
  secret: string
  otpauthUri: string
  expiresAt: string
}

export interface MfaConfirmResponse {
  auth: AuthResponse
  recoveryCodes: string[]
}

export interface RegisterInput {
  nickname: string
  email: string
  password: string
  confirmPassword?: string
}

export interface LoginInput {
  email: string
  password: string
}
