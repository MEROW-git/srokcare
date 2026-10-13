import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, LoginInput, RegisterInput, AuthResponse } from '@/types/auth'
import { authService } from '@/services/authService'
import { isMockMode } from '@/services/apiClient'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (input: LoginInput) => Promise<string | null>
  verifyMfaLogin: (challengeToken: string, code: string) => Promise<void>
  replaceAuth: (response: AuthResponse) => void
  register: (input: RegisterInput) => Promise<boolean>
  verifyRegistration: (input: RegisterInput & { code: string }) => Promise<void>
  loginAsDemoUser: () => void
  loginAsAdmin: () => void
  logout: () => void
  updateNickname: (newNickname: string) => void
  updateUser: (updatedUser: User) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'fixkh_auth_user'
const TOKEN_STORAGE_KEY = 'fixkh_auth_token'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY)
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (saved && (isMockMode() || (token && !token.startsWith('mock-')))) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return isMockMode() ? authService.getDemoUser() : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [user])

  const login = async (input: LoginInput) => {
    const res = await authService.login(input)
    if ('challengeToken' in res) {
      setUser(null)
      return res.challengeToken
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setUser(res.user)
    return null
  }

  const verifyMfaLogin = async (challengeToken: string, code: string) => {
    const res = await authService.verifyMfaLogin(challengeToken, code)
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setUser(res.user)
  }

  const replaceAuth = (response: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
    setUser(response.user)
  }

  const register = async (input: RegisterInput) => {
    const res = await authService.register(input)
    if (!res) return false
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setUser(res.user)
    return true
  }

  const verifyRegistration = async (input: RegisterInput & { code: string }) => {
    const res = await authService.verifyRegistration(input)
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setUser(res.user)
  }

  const loginAsDemoUser = () => {
    if (!isMockMode()) return
    const demo = authService.getDemoUser()
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-jwt-demo-token')
    setUser(demo)
  }

  const loginAsAdmin = () => {
    if (!isMockMode()) return
    const admin = authService.getAdminUser()
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-jwt-admin-token')
    setUser(admin)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  const updateNickname = (newNickname: string) => {
    if (!user) return
    const updated = { ...user, nickname: newNickname.trim() }
    setUser(updated)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const refreshUser = async () => {
    const fresh = await authService.getCurrentUser()
    if (fresh) {
      setUser(fresh)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        verifyMfaLogin,
        replaceAuth,
        register,
        verifyRegistration,
        loginAsDemoUser,
        loginAsAdmin,
        logout,
        updateNickname,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
