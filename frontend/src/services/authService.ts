import { apiClient, isMockMode } from './apiClient'
import type { User, LoginInput, RegisterInput, AuthResponse } from '@/types/auth'

const DEFAULT_DEMO_USER: User = {
  id: 'usr-demo-01',
  nickname: 'SOK Citizen',
  email: 'sok.citizen@fixkh-demo.local',
  role: 'USER',
  createdAt: '2026-09-01T00:00:00Z',
}

const DEFAULT_ADMIN_USER: User = {
  id: 'usr-admin-01',
  nickname: 'Civic Moderator Sothea',
  email: 'moderator@fixkh-demo.local',
  role: 'ADMIN',
  createdAt: '2026-08-01T00:00:00Z',
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200))
      // Check if trying admin demo
      const isAdmin = input.email.includes('admin') || input.email.includes('moderator')
      const user = isAdmin ? DEFAULT_ADMIN_USER : { ...DEFAULT_DEMO_USER, email: input.email }
      const mockToken = `mock-jwt-${isAdmin ? 'admin' : 'user'}-${Date.now()}`
      return { token: mockToken, user }
    }
    const response = await apiClient.post<AuthResponse>('/auth/login', input)
    return response.data
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 250))
      const user: User = {
        id: `usr-${Date.now().toString(36)}`,
        nickname: input.nickname.trim(),
        email: input.email.trim(),
        role: 'USER',
        createdAt: new Date().toISOString(),
      }
      const mockToken = `mock-jwt-user-${Date.now()}`
      return { token: mockToken, user }
    }
    const response = await apiClient.post<AuthResponse>('/auth/register', input)
    return response.data
  },

  async getCurrentUser(): Promise<User | null> {
    if (isMockMode()) {
      const rawUser = localStorage.getItem('fixkh_auth_user')
      if (rawUser) {
        return JSON.parse(rawUser)
      }
      return DEFAULT_DEMO_USER
    }
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response.data
    } catch {
      return null
    }
  },

  getDemoUser(): User {
    return DEFAULT_DEMO_USER
  },

  getAdminUser(): User {
    return DEFAULT_ADMIN_USER
  },
}
