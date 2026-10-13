import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userService } from '@/services/userService'
import { apiClient } from '@/services/apiClient'
import type { User, PublicProfile } from '@/types/auth'
import type { Report } from '@/types/report'

describe('Profile & Identity Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('updates profile through apiClient when in backend mode', async () => {
    const mockUser: User = {
      id: 'bb5fc6f1-64c2-4f0f-bec8-a4f3d85d81f4',
      nickname: 'Updated Citizen',
      email: 'sok@example.com',
      role: 'CITIZEN',
      bio: 'Active civic community contributor',
    }

    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({ data: mockUser })

    const result = await userService.updateProfile({
      nickname: 'Updated Citizen',
      bio: 'Active civic community contributor',
    })

    expect(apiClient.put).toHaveBeenCalledWith('/users/me/profile', {
      nickname: 'Updated Citizen',
      bio: 'Active civic community contributor',
    })
    expect(result.nickname).toBe('Updated Citizen')
    expect(result.bio).toBe('Active civic community contributor')
  })

  it('fetches public profile without exposing private fields', async () => {
    const mockPublicProfile: PublicProfile = {
      nickname: 'SOK Citizen',
      role: 'CITIZEN',
      createdAt: '2026-09-01T00:00:00Z',
      bio: 'Community advocate',
      avatarUrl: 'http://localhost:8080/api/v1/users/SOK%20Citizen/avatar',
      coverUrl: 'http://localhost:8080/api/v1/users/SOK%20Citizen/cover',
      totalReports: 12,
      resolvedReports: 8,
    }

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockPublicProfile })

    const result = await userService.getPublicProfile('SOK Citizen')

    expect(apiClient.get).toHaveBeenCalledWith('/users/SOK%20Citizen/public-profile')
    expect(result.nickname).toBe('SOK Citizen')
    expect(result.totalReports).toBe(12)
    expect(result.resolvedReports).toBe(8)
    expect((result as unknown as Record<string, unknown>).email).toBeUndefined()
    expect((result as unknown as Record<string, unknown>).id).toBeUndefined()
  })

  it('fetches public reports for author pseudonym with pagination', async () => {
    const mockReports: Report[] = [
      {
        id: 'rep-01',
        title: 'Damaged sidewalk',
        description: 'Needs urgent repair near central market',
        category: 'ROAD_DAMAGE',
        status: 'RESOLVED',
        authorNickname: 'SOK Citizen',
        latitude: 11.5564,
        longitude: 104.9282,
        province: 'Phnom Penh',
        district: 'Daun Penh',
        images: [],
        supportCount: 5,
        commentCount: 2,
        supportedByMe: false,
        createdAt: '2026-09-10T00:00:00Z',
        updatedAt: '2026-09-12T00:00:00Z',
      },
    ]

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockReports })

    const result = await userService.getPublicReports('SOK Citizen', 0, 20)

    expect(apiClient.get).toHaveBeenCalledWith('/users/SOK%20Citizen/reports', {
      params: { page: 0, size: 20 },
    })
    expect(result).toHaveLength(1)
    expect(result[0].authorNickname).toBe('SOK Citizen')
  })
})
