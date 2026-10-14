import { afterEach, describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'
import { apiClient, SESSION_EXPIRED_EVENT } from '@/services/apiClient'

const setupBrowserStorage = () => {
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  })
  const browserEvents = new EventTarget()
  vi.stubGlobal('window', browserEvents)
  return browserEvents
}

afterEach(() => vi.unstubAllGlobals())

describe('expired API session', () => {
  it('clears the matching session and alerts the auth context on 401', async () => {
    const browserEvents = setupBrowserStorage()
    localStorage.setItem('fixkh_auth_token', 'old-token')
    localStorage.setItem('fixkh_auth_user', '{"id":"1"}')
    const expired = vi.fn()
    browserEvents.addEventListener(SESSION_EXPIRED_EVENT, expired)

    await expect(apiClient.get('/reports', {
      adapter: async config => {
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          config, data: {}, headers: {}, status: 401, statusText: 'Unauthorized',
        })
      },
    })).rejects.toBeInstanceOf(AxiosError)

    expect(localStorage.getItem('fixkh_auth_token')).toBeNull()
    expect(localStorage.getItem('fixkh_auth_user')).toBeNull()
    expect(expired).toHaveBeenCalledOnce()
  })

  it('does not clear a newer session when an old request returns 401', async () => {
    const browserEvents = setupBrowserStorage()
    localStorage.setItem('fixkh_auth_token', 'old-token')
    const expired = vi.fn()
    browserEvents.addEventListener(SESSION_EXPIRED_EVENT, expired)

    await expect(apiClient.get('/reports', {
      adapter: async config => {
        localStorage.setItem('fixkh_auth_token', 'new-token')
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          config, data: {}, headers: {}, status: 401, statusText: 'Unauthorized',
        })
      },
    })).rejects.toBeInstanceOf(AxiosError)

    expect(localStorage.getItem('fixkh_auth_token')).toBe('new-token')
    expect(expired).not.toHaveBeenCalled()
  })
})
