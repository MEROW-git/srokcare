import { Client } from '@stomp/stompjs'
import type { RealtimeReportEvent } from '@/types/realtime'
import { isMockMode } from './apiClient'

export const getWebSocketUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
  const isSecure = typeof window !== 'undefined' && window.location?.protocol === 'https:'
  const wsProtocol = isSecure ? 'wss:' : 'ws:'

  try {
    const baseOrigin = typeof window !== 'undefined' && window.location?.href ? window.location.href : 'http://localhost:8080'
    const url = new URL(apiBase, baseOrigin)
    return `${wsProtocol}//${url.host}/ws`
  } catch {
    return 'ws://localhost:8080/ws'
  }
}

type EventCallback = (event: RealtimeReportEvent) => void
type ReconnectCallback = () => void

class WebSocketService {
  private client: Client | null = null
  private isConnected = false
  private hasConnectedBefore = false
  private subscriptions: Map<string, Set<EventCallback>> = new Map()
  private reconnectCallbacks: Set<ReconnectCallback> = new Set()
  private activeStompSubscriptions: Map<string, { unsubscribe: () => void }> = new Map()
  private recentEventKeys: Set<string> = new Set()
  private broadcastChannel: BroadcastChannel | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('fixkh_realtime_events')
        this.broadcastChannel.onmessage = (msg) => {
          if (msg.data && msg.data.eventType && msg.data.reportId) {
            this.handleIncomingEvent(msg.data, false)
          }
        }
      } catch (err) {
        console.warn('BroadcastChannel initialization notice:', err)
      }
    }
  }

  public init() {
    if (this.client) return

    // If strictly in mock mode or environment lacks WebSocket (e.g. Node/SSR), skip activation
    if (isMockMode() || typeof WebSocket === 'undefined') {
      return
    }

    const brokerURL = getWebSocketUrl()

    this.client = new Client({
      brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        const isReconnect = this.hasConnectedBefore
        this.isConnected = true
        this.hasConnectedBefore = true

        // Resubscribe active topics
        this.subscriptions.forEach((_, topic) => {
          this.subscribeStompTopic(topic)
        })

        // If this is a reconnect (or initial connection after offline), invoke reconnect callbacks
        if (isReconnect) {
          this.reconnectCallbacks.forEach((cb) => {
            try {
              cb()
            } catch (err) {
              console.error('Error in realtime reconnect handler:', err)
            }
          })
        }
      },
      onDisconnect: () => {
        this.isConnected = false
        this.activeStompSubscriptions.clear()
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message'])
      },
      onWebSocketError: () => {
        // Fallback silently: existing REST/mock behavior remains fully functional
        this.isConnected = false
      },
    })

    try {
      this.client.activate()
    } catch (err) {
      console.warn('WebSocket activation error:', err)
    }
  }

  private subscribeStompTopic(topic: string) {
    if (!this.client || !this.isConnected) return
    if (this.activeStompSubscriptions.has(topic)) return

    try {
      const sub = this.client.subscribe(topic, (message) => {
        try {
          const event: RealtimeReportEvent = JSON.parse(message.body)
          this.handleIncomingEvent(event, true)
        } catch (err) {
          console.warn('Could not parse STOMP event payload:', err)
        }
      })

      this.activeStompSubscriptions.set(topic, sub)
    } catch (err) {
      console.warn(`Failed to subscribe to topic ${topic}:`, err)
    }
  }

  private handleIncomingEvent(event: RealtimeReportEvent, broadcastToOthers: boolean) {
    if (!event || !event.eventType || !event.reportId) return

    // Deduplicate rapid identical events (prevent duplicate item insertions & repeated processing)
    const key = `${event.eventType}:${event.reportId}:${event.timestamp}`
    if (this.recentEventKeys.has(key)) {
      return
    }
    this.recentEventKeys.add(key)
    setTimeout(() => {
      this.recentEventKeys.delete(key)
    }, 1500)

    // Notify subscribers for general /topic/reports
    const generalSubs = this.subscriptions.get('/topic/reports')
    if (generalSubs) {
      generalSubs.forEach((cb) => cb(event))
    }

    // Notify subscribers for /topic/reports/{reportId}
    const specificTopic = `/topic/reports/${event.reportId}`
    const specificSubs = this.subscriptions.get(specificTopic)
    if (specificSubs) {
      specificSubs.forEach((cb) => cb(event))
    }

    // Cross-tab broadcast for mock mode or multi-tab coordination
    if (broadcastToOthers && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event)
      } catch (err) {
        // ignore
      }
    }
  }

  public subscribe(
    topic: string,
    callback: EventCallback,
    onReconnect?: ReconnectCallback
  ): () => void {
    this.init()

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set())
    }
    this.subscriptions.get(topic)!.add(callback)

    if (onReconnect) {
      this.reconnectCallbacks.add(onReconnect)
    }

    if (this.isConnected) {
      this.subscribeStompTopic(topic)
    }

    return () => {
      const subs = this.subscriptions.get(topic)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscriptions.delete(topic)
          const activeSub = this.activeStompSubscriptions.get(topic)
          if (activeSub) {
            try {
              activeSub.unsubscribe()
            } catch (_) {}
            this.activeStompSubscriptions.delete(topic)
          }
        }
      }
      if (onReconnect) {
        this.reconnectCallbacks.delete(onReconnect)
      }
    }
  }

  public broadcastLocalEvent(event: RealtimeReportEvent) {
    this.handleIncomingEvent(event, true)
  }

  public getConnectedStatus(): boolean {
    return this.isConnected
  }
}

export const websocketService = new WebSocketService()
