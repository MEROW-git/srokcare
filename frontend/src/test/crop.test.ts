import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from '@/services/userService'
import { apiClient } from '@/services/apiClient'
import { translations } from '@/i18n/translations'
import type { User } from '@/types/auth'

describe('Image Crop and Upload Logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Aspect Ratios and Crop Geometry Math', () => {
    const COVER_ASPECT_RATIO = 8 / 3

    it('verifies avatar aspect ratio is 1:1 and cover aspect ratio matches banner proportion', () => {
      const avatarRatio = 1 / 1
      expect(avatarRatio).toBe(1)
      expect(COVER_ASPECT_RATIO).toBeCloseTo(2.667, 3)
      // Standard 1200x450 matches 8:3
      expect(1200 / 450).toBeCloseTo(COVER_ASPECT_RATIO, 3)
    })

    it('calculates base scale so image always fully covers viewport without letterboxing', () => {
      const calcBaseScale = (imgW: number, imgH: number, vpW: number, vpH: number) => {
        return Math.max(vpW / imgW, vpH / imgH)
      }

      // Square viewport (avatar: 280x280) with landscape photo (800x600)
      const scaleAvatar = calcBaseScale(800, 600, 280, 280)
      expect(800 * scaleAvatar).toBeGreaterThanOrEqual(280)
      expect(600 * scaleAvatar).toBe(280) // Scaled height touches viewport height

      // Wide viewport (cover: 480x180) with portrait photo (600x800)
      const scaleCover = calcBaseScale(600, 800, 480, 180)
      expect(600 * scaleCover).toBe(480) // Scaled width touches viewport width
      expect(800 * scaleCover).toBeGreaterThanOrEqual(180)
    })

    it('clamps pan offsets strictly within image boundaries at any zoom level', () => {
      const getBounds = (
        imgW: number,
        imgH: number,
        vpW: number,
        vpH: number,
        zoom: number
      ) => {
        const baseScale = Math.max(vpW / imgW, vpH / imgH)
        const scale = baseScale * zoom
        const renderedW = imgW * scale
        const renderedH = imgH * scale
        const maxX = Math.max(0, (renderedW - vpW) / 2)
        const maxY = Math.max(0, (renderedH - vpH) / 2)
        return { maxX, maxY }
      }

      // Square avatar with square image at zoom 1.0 -> no pan freedom
      const bounds1 = getBounds(500, 500, 280, 280, 1.0)
      expect(bounds1.maxX).toBe(0)
      expect(bounds1.maxY).toBe(0)

      // Square avatar with square image at zoom 2.0 -> pan freedom allowed
      const bounds2 = getBounds(500, 500, 280, 280, 2.0)
      expect(bounds2.maxX).toBe(140)
      expect(bounds2.maxY).toBe(140)

      // Clamping logic
      const clamp = (val: number, max: number) => Math.min(max, Math.max(-max, val))
      expect(clamp(200, bounds2.maxX)).toBe(140)
      expect(clamp(-300, bounds2.maxX)).toBe(-140)
      expect(clamp(50, bounds2.maxX)).toBe(50)
    })

    it('computes exact source crop coordinates mapping back to original image space', () => {
      // 1000x1000 image, 300x300 viewport, zoom = 1.0, pan = 0,0
      const imgW = 1000
      const imgH = 1000
      const vpW = 300
      const vpH = 300
      const zoom = 1.0
      const baseScale = Math.max(vpW / imgW, vpH / imgH) // 0.3
      const scale = baseScale * zoom // 0.3

      const sw = vpW / scale // 1000
      const sh = vpH / scale // 1000
      const sx = imgW / 2 - (0 + vpW / 2) / scale // 500 - 150/0.3 = 0
      const sy = imgH / 2 - (0 + vpH / 2) / scale // 500 - 150/0.3 = 0

      expect(sw).toBe(1000)
      expect(sh).toBe(1000)
      expect(sx).toBe(0)
      expect(sy).toBe(0)
    })
  })

  describe('User Service Image Upload and Removal', () => {
    it('uploads cropped avatar file to backend API endpoint', async () => {
      const mockUpdatedUser: User = {
        id: 'usr-123',
        nickname: 'CivicHero',
        email: 'civic@fixkh.test',
        role: 'CITIZEN',
        avatarUrl: '/api/v1/users/CivicHero/avatar',
      }

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockUpdatedUser })

      const testFile = new File(['mock image content'], 'avatar_cropped.jpg', {
        type: 'image/jpeg',
      })

      const result = await userService.uploadAvatar(testFile)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/me/avatar',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
      expect(result.avatarUrl).toBe('/api/v1/users/CivicHero/avatar')
    })

    it('uploads cropped cover file to backend API endpoint', async () => {
      const mockUpdatedUser: User = {
        id: 'usr-123',
        nickname: 'CivicHero',
        email: 'civic@fixkh.test',
        role: 'CITIZEN',
        coverUrl: '/api/v1/users/CivicHero/cover',
      }

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockUpdatedUser })

      const testFile = new File(['mock cover content'], 'cover_cropped.png', {
        type: 'image/png',
      })

      const result = await userService.uploadCover(testFile)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/me/cover',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      )
      expect(result.coverUrl).toBe('/api/v1/users/CivicHero/cover')
    })

    it('removes avatar and cover images correctly', async () => {
      const userWithoutAvatar: User = {
        id: 'usr-123',
        nickname: 'CivicHero',
        email: 'civic@fixkh.test',
        role: 'CITIZEN',
      }
      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: userWithoutAvatar })
      const res1 = await userService.removeAvatar()
      expect(apiClient.delete).toHaveBeenCalledWith('/users/me/avatar')
      expect(res1.avatarUrl).toBeUndefined()

      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: userWithoutAvatar })
      const res2 = await userService.removeCover()
      expect(apiClient.delete).toHaveBeenCalledWith('/users/me/cover')
      expect(res2.coverUrl).toBeUndefined()
    })
  })

  describe('Internationalization Keys for Crop and Zoom', () => {
    it('contains all required crop translation keys in both English and Khmer', () => {
      const requiredKeys = [
        'cropAvatarTitle',
        'cropCoverTitle',
        'cropZoom',
        'cropZoomIn',
        'cropZoomOut',
        'cropReset',
        'cropDragHint',
        'cropSave',
        'cropCancel',
        'cropProcessing',
        'cropUploading',
        'cropImageTooSmall',
        'cropLoadFailed',
      ] as const

      for (const key of requiredKeys) {
        expect(translations.en[key]).toBeDefined()
        expect(translations.en[key].length).toBeGreaterThan(0)

        expect(translations.km[key]).toBeDefined()
        expect(translations.km[key].length).toBeGreaterThan(0)
      }
    })
  })
})
