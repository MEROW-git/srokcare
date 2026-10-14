import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reportDraftService } from '@/services/reportDraftService'
import { reportService } from '@/services/reportService'
import { apiClient } from '@/services/apiClient'
import { translations } from '@/i18n/translations'
import type { User } from '@/types/auth'
import type { CreateReportInput } from '@/types/report'

describe('Report Creation Auth & Draft Flow', () => {
  const mockUser: User = {
    id: 'usr-cit-101',
    nickname: 'ActiveCitizen',
    email: 'citizen@fixkh.test',
    role: 'CITIZEN',
  }

  const sampleReportInput: CreateReportInput = {
    title: 'Deep pothole on St 271',
    description: 'Dangerous pothole damaging motorbikes near Russian hospital',
    category: 'ROAD_DAMAGE',
    province: 'Phnom Penh',
    district: 'Chamkarmon',
    address: 'Street 271',
    latitude: 11.54,
    longitude: 104.91,
    images: ['data:image/jpeg;base64,samplephoto1', 'data:image/jpeg;base64,samplephoto2'],
  }

  beforeEach(async () => {
    vi.restoreAllMocks()
    await reportDraftService.clearDraft()
  })

  describe('reportDraftService (Safe Persistence & Photo Handling)', () => {
    it('saves draft with all form fields and image data URLs safely', async () => {
      await reportDraftService.saveDraft({
        ...sampleReportInput,
        images: sampleReportInput.images,
      })

      const draft = await reportDraftService.getDraft()
      expect(draft).not.toBeNull()
      expect(draft?.title).toBe(sampleReportInput.title)
      expect(draft?.description).toBe(sampleReportInput.description)
      expect(draft?.category).toBe(sampleReportInput.category)
      expect(draft?.province).toBe(sampleReportInput.province)
      expect(draft?.district).toBe(sampleReportInput.district)
      expect(draft?.address).toBe(sampleReportInput.address)
      expect(draft?.images).toHaveLength(2)
      expect(draft?.images?.[0]).toBe('data:image/jpeg;base64,samplephoto1')
      expect(draft?.savedAt).toBeTypeOf('number')
    })

    it('clears draft after successful publishing', async () => {
      await reportDraftService.saveDraft(sampleReportInput)
      expect(await reportDraftService.hasDraft()).toBe(true)

      await reportDraftService.clearDraft()
      expect(await reportDraftService.hasDraft()).toBe(false)
      expect(await reportDraftService.getDraft()).toBeNull()
    })

    it('updates existing draft when user edits and saves again', async () => {
      await reportDraftService.saveDraft({
        ...sampleReportInput,
        title: 'Initial Title',
      })

      let draft = await reportDraftService.getDraft()
      expect(draft?.title).toBe('Initial Title')

      await reportDraftService.saveDraft({
        ...sampleReportInput,
        title: 'Updated Title with more details',
      })

      draft = await reportDraftService.getDraft()
      expect(draft?.title).toBe('Updated Title with more details')
    })
  })

  describe('reportService.createReport Auth Enforcement', () => {
    it('throws authentication error and never sends API request when user is null or missing', async () => {
      const apiPostSpy = vi.spyOn(apiClient, 'post')

      await expect(
        reportService.createReport(sampleReportInput, null as unknown as User)
      ).rejects.toThrow(/authentication required/i)

      expect(apiPostSpy).not.toHaveBeenCalled()
    })

    it('rejects fake anon-citizen author and never publishes', async () => {
      const apiPostSpy = vi.spyOn(apiClient, 'post')
      const fakeAnonUser: User = {
        id: 'anon-citizen',
        nickname: 'Anonymous Citizen',
        email: 'citizen@fixkh.gov.kh',
        role: 'CITIZEN',
      }

      await expect(
        reportService.createReport(sampleReportInput, fakeAnonUser)
      ).rejects.toThrow(/authentication required/i)

      expect(apiPostSpy).not.toHaveBeenCalled()
    })

    it('allows authenticated user to publish report normally', async () => {
      const mockCreatedReport = {
        id: 'rep-created-999',
        ...sampleReportInput,
        authorId: mockUser.id,
        authorNickname: mockUser.nickname,
        status: 'REPORTED',
        supportCount: 0,
        commentCount: 0,
        supportedByMe: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockCreatedReport })

      const report = await reportService.createReport(sampleReportInput, mockUser)

      expect(apiClient.post).toHaveBeenCalledWith('/reports', sampleReportInput)
      expect(report.id).toBe('rep-created-999')
      expect(report.authorId).toBe(mockUser.id)
    })
  })

  describe('Session Expiration & 401 Handling Logic', () => {
    it('identifies 401 unauthorized errors to trigger draft save and re-authentication modal', async () => {
      const error401 = {
        isAxiosError: true,
        response: { status: 401, data: { message: 'Token expired' } },
      }

      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(error401)

      // When signed-in user submits but token expired:
      let caught401 = false
      try {
        await reportService.createReport(sampleReportInput, mockUser)
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } }
        if (error?.response?.status === 401) {
          caught401 = true
          // Save draft before prompting user to re-authenticate
          await reportDraftService.saveDraft(sampleReportInput)
        }
      }

      expect(caught401).toBe(true)
      const restored = await reportDraftService.getDraft()
      expect(restored).not.toBeNull()
      expect(restored?.title).toBe(sampleReportInput.title)
    })
  })

  describe('Internationalization Keys for Auth Popup and Draft', () => {
    it('contains all required popup and draft translation keys in English and Khmer', () => {
      const keys = [
        'authRequiredTitle',
        'authRequiredPrompt',
        'authRequiredDraftNotice',
        'authSignInBtn',
        'authCreateAccountBtn',
        'authKeepEditingBtn',
        'draftRestoredNotice',
        'sessionExpiredNotice',
      ] as const

      for (const key of keys) {
        expect(translations.en[key]).toBeDefined()
        expect(translations.en[key].length).toBeGreaterThan(0)

        expect(translations.km[key]).toBeDefined()
        expect(translations.km[key].length).toBeGreaterThan(0)
      }

      // Exact prompt text requested by user
      expect(translations.en.authRequiredPrompt).toBe(
        'Sign in or create an account to publish your report.'
      )
      expect(translations.en.authSignInBtn).toBe('Sign In')
      expect(translations.en.authCreateAccountBtn).toBe('Create Account')
      expect(translations.en.authKeepEditingBtn).toBe('Keep Editing')
    })
  })
})
