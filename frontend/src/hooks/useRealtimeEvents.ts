import { useEffect, useRef } from 'react'
import type { RealtimeReportEvent } from '@/types/realtime'
import { websocketService } from '@/services/websocketService'

interface UseRealtimeOptions {
  topic?: string
  onEvent?: (event: RealtimeReportEvent) => void
  onRefresh?: () => void
  debounceMs?: number
}

/**
 * Subscribes to real-time events for public reports or a specific report.
 * Debounces rapid incoming events to avoid repeated refetches when several events arrive quickly.
 * Automatically refetches on reconnection so updates missed while offline appear.
 */
export function useRealtimeEvents({
  topic = '/topic/reports',
  onEvent,
  onRefresh,
  debounceMs = 200,
}: UseRealtimeOptions) {
  const onEventRef = useRef(onEvent)
  const onRefreshRef = useRef(onRefresh)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    onEventRef.current = onEvent
    onRefreshRef.current = onRefresh
  })

  useEffect(() => {
    const handleEvent = (event: RealtimeReportEvent) => {
      if (onEventRef.current) {
        onEventRef.current(event)
      }

      if (onRefreshRef.current) {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
          if (onRefreshRef.current) {
            onRefreshRef.current()
          }
        }, debounceMs)
      }
    }

    const handleReconnect = () => {
      if (onRefreshRef.current) {
        onRefreshRef.current()
      }
    }

    const unsubscribe = websocketService.subscribe(topic, handleEvent, handleReconnect)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      unsubscribe()
    }
  }, [topic, debounceMs])
}
