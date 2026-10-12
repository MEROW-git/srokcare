import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User, LoginInput, RegisterInput } from '@/types/auth'
import { authService } from '@/services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  loginAsDemoUser: () => void
  loginAsAdmin: () => void
  logout: () => void
  updateNickname: (newNickname: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'fixkh_auth_user'
const TOKEN_STORAGE_KEY = 'fixkh_auth_token'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return authService.getDemoUser()
      }
    }
    // Default to initial demo user for frictionless demo experience
    return authService.getDemoUser()
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
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setUser(res.user)
  }

  const register = async (input: RegisterInput) => {
    const res = await authService.register(input)
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setUser(res.user)
  }

  const loginAsDemoUser = () => {
    const demo = authService.getDemoUser()
    localStorage.setItem(TOKEN_STORAGE_KEY, 'mock-jwt-demo-token')
    setUser(demo)
  }

  const loginAsAdmin = () => {
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

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        loginAsDemoUser,
        loginAsAdmin,
        logout,
        updateNickname,
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
