import { apiClient, isMockMode } from './apiClient'
import type { User, PublicProfile } from '@/types/auth'
import type { Report } from '@/types/report'
import { mockStorage } from './mockStorage'

export const userService = {
  async updateProfile(data: { nickname: string; bio?: string }): Promise<User> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200))
      const rawUser = localStorage.getItem('fixkh_auth_user')
      const current: User = rawUser ? JSON.parse(rawUser) : {
        id: 'usr-demo-01',
        nickname: 'SOK Citizen',
        email: 'sok.citizen@fixkh-demo.local',
        role: 'CITIZEN',
      }
      const updated: User = {
        ...current,
        nickname: data.nickname.trim(),
        bio: data.bio === undefined ? current.bio : data.bio.trim() || undefined,
      }
      localStorage.setItem('fixkh_auth_user', JSON.stringify(updated))
      return updated
    }
    const response = await apiClient.put<User>('/users/me/profile', data)
    return response.data
  },

  async uploadAvatar(file: File): Promise<User> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 300))
      const rawUser = localStorage.getItem('fixkh_auth_user')
      const current: User = rawUser ? JSON.parse(rawUser) : {
        id: 'usr-demo-01',
        nickname: 'SOK Citizen',
        email: 'sok.citizen@fixkh-demo.local',
        role: 'CITIZEN',
      }
      const avatarUrl = URL.createObjectURL(file)
      const updated: User = { ...current, avatarUrl }
      localStorage.setItem('fixkh_auth_user', JSON.stringify(updated))
      return updated
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<User>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async removeAvatar(): Promise<User> {
    if (isMockMode()) {
      const rawUser = localStorage.getItem('fixkh_auth_user')
      const current: User = rawUser ? JSON.parse(rawUser) : {
        id: 'usr-demo-01',
        nickname: 'SOK Citizen',
        email: 'sok.citizen@fixkh-demo.local',
        role: 'CITIZEN',
      }
      const updated: User = { ...current, avatarUrl: undefined }
      localStorage.setItem('fixkh_auth_user', JSON.stringify(updated))
      return updated
    }
    const response = await apiClient.delete<User>('/users/me/avatar')
    return response.data
  },

  async uploadCover(file: File): Promise<User> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 300))
      const rawUser = localStorage.getItem('fixkh_auth_user')
      const current: User = rawUser ? JSON.parse(rawUser) : {
        id: 'usr-demo-01',
        nickname: 'SOK Citizen',
        email: 'sok.citizen@fixkh-demo.local',
        role: 'CITIZEN',
      }
      const coverUrl = URL.createObjectURL(file)
      const updated: User = { ...current, coverUrl }
      localStorage.setItem('fixkh_auth_user', JSON.stringify(updated))
      return updated
    }
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<User>('/users/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async removeCover(): Promise<User> {
    if (isMockMode()) {
      const rawUser = localStorage.getItem('fixkh_auth_user')
      const current: User = rawUser ? JSON.parse(rawUser) : {
        id: 'usr-demo-01',
        nickname: 'SOK Citizen',
        email: 'sok.citizen@fixkh-demo.local',
        role: 'CITIZEN',
      }
      const updated: User = { ...current, coverUrl: undefined }
      localStorage.setItem('fixkh_auth_user', JSON.stringify(updated))
      return updated
    }
    const response = await apiClient.delete<User>('/users/me/cover')
    return response.data
  },

  async getPublicProfile(identifier: string): Promise<PublicProfile> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150))
      const allReports = mockStorage.getReports()
      const saved = localStorage.getItem('fixkh_auth_user')
      const mockUser: User | null = saved ? JSON.parse(saved) : null
      const nickname = mockUser?.id === identifier ? mockUser.nickname : identifier
      const userReports = allReports.filter(
        (r: Report) => r.authorId === identifier || r.authorNickname.toLowerCase() === nickname.toLowerCase()
      )
      const resolvedCount = userReports.filter((r: Report) => r.status === 'RESOLVED').length
      const activeCount = userReports.filter((r: Report) => r.status === 'UNDER_REVIEW' || r.status === 'IN_PROGRESS').length
      return {
        nickname,
        role: mockUser?.id === identifier ? mockUser.role : nickname.toLowerCase().includes('moderator') || nickname.toLowerCase().includes('admin') ? 'ADMIN' : 'CITIZEN',
        createdAt: mockUser?.id === identifier ? mockUser.createdAt || '2026-09-01T00:00:00Z' : '2026-09-01T00:00:00Z',
        bio: mockUser?.id === identifier ? mockUser.bio : 'FixKH civic community contributor dedicated to improving local public infrastructure.',
        avatarUrl: mockUser?.id === identifier ? mockUser.avatarUrl : undefined,
        coverUrl: mockUser?.id === identifier ? mockUser.coverUrl : undefined,
        totalReports: userReports.length,
        resolvedReports: resolvedCount,
        activeReports: activeCount,
      }
    }
    const response = await apiClient.get<PublicProfile>(`/users/${encodeURIComponent(identifier)}/public-profile`)
    return response.data
  },

  async getPublicReports(identifier: string, page = 0, size = 20): Promise<Report[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150))
      const allReports = mockStorage.getReports()
      return allReports.filter(
        (r: Report) => r.authorNickname.toLowerCase() === identifier.toLowerCase()
      ).slice(page * size, (page + 1) * size)
    }
    const response = await apiClient.get<Report[]>(`/users/${encodeURIComponent(identifier)}/reports`, {
      params: { page, size },
    })
    return response.data
  },
}
