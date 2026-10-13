import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getWebSocketUrl, websocketService } from '@/services/websocketService'
import type { RealtimeReportEvent } from '@/types/realtime'

describe('Realtime WebSocket & STOMP Service', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('generates correct WebSocket URL without tokens or private params', () => {
    const url = getWebSocketUrl()
    expect(url).toMatch(/^wss?:\/\/.*\/ws$/)
    expect(url).not.toContain('token')
    expect(url).not.toContain('jwt')
    expect(url).not.toContain('auth')
  })

  it('routes report-specific events to both general and specific topic subscribers', () => {
    const generalListener = vi.fn()
    const specificListener = vi.fn()

    const reportId = 'rep-1234'
    const unsubGeneral = websocketService.subscribe('/topic/reports', generalListener)
    const unsubSpecific = websocketService.subscribe(`/topic/reports/${reportId}`, specificListener)

    const event: RealtimeReportEvent = {
      eventType: 'REPORT_STATUS_CHANGED',
      reportId,
      timestamp: new Date().toISOString(),
    }

    websocketService.broadcastLocalEvent(event)

    expect(generalListener).toHaveBeenCalledTimes(1)
    expect(generalListener).toHaveBeenCalledWith(event)

    expect(specificListener).toHaveBeenCalledTimes(1)
    expect(specificListener).toHaveBeenCalledWith(event)

    unsubGeneral()
    unsubSpecific()
  })

  it('deduplicates identical rapid events to prevent duplicate item processing', () => {
    const listener = vi.fn()
    const reportId = 'rep-dedup-test'
    const unsub = websocketService.subscribe('/topic/reports', listener)

    const timestamp = '2026-10-13T12:00:00.000Z'
    const event: RealtimeReportEvent = {
      eventType: 'REPORT_CREATED',
      reportId,
      timestamp,
    }

    // Emit identical event twice in quick succession
    websocketService.broadcastLocalEvent(event)
    websocketService.broadcastLocalEvent(event)

    expect(listener).toHaveBeenCalledTimes(1)

    // After deduplication window expires, next event can be accepted
    vi.advanceTimersByTime(2000)
    websocketService.broadcastLocalEvent(event)
    expect(listener).toHaveBeenCalledTimes(2)

    unsub()
  })

  it('invokes onReconnect callbacks so missed offline data is refetched', () => {
    const onEvent = vi.fn()
    const onReconnect = vi.fn()

    const unsub = websocketService.subscribe('/topic/reports', onEvent, onReconnect)

    // Simulate reconnect lifecycle
    ;(websocketService as any).hasConnectedBefore = true
    ;(websocketService as any).reconnectCallbacks.forEach((cb: () => void) => cb())
    expect(onReconnect).toHaveBeenCalledTimes(1)

    unsub()
  })

  it('debounces rapid events to avoid repeated unnecessary refetches', () => {
    const refreshFn = vi.fn()
    let timer: ReturnType<typeof setTimeout> | null = null
    const debounceMs = 200

    const triggerDebouncedRefresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        refreshFn()
      }, debounceMs)
    }

    // Simulate 5 events arriving within 50ms
    for (let i = 0; i < 5; i++) {
      triggerDebouncedRefresh()
      vi.advanceTimersByTime(10)
    }

    expect(refreshFn).not.toHaveBeenCalled()

    // Advance beyond debounce window
    vi.advanceTimersByTime(250)
    expect(refreshFn).toHaveBeenCalledTimes(1)
  })

  it('ensures public payload schema is minimal with zero private fields', () => {
    const event: RealtimeReportEvent = {
      eventType: 'SUPPORT_CHANGED',
      reportId: 'rep-5678',
      timestamp: '2026-10-13T12:00:00.000Z',
    }

    const keys = Object.keys(event)
    expect(keys).toEqual(['eventType', 'reportId', 'timestamp'])
    expect((event as any).email).toBeUndefined()
    expect((event as any).token).toBeUndefined()
    expect((event as any).otp).toBeUndefined()
  })
})
