import type { ReportCategory } from '@/types/report'

export interface ReportDraft {
  title: string
  description: string
  category: ReportCategory
  province: string
  district: string
  address?: string
  latitude: number
  longitude: number
  images?: string[]
  savedAt: number
}

const DB_NAME = 'fixkh_report_drafts_db'
const DB_VERSION = 1
const STORE_NAME = 'drafts'
const DRAFT_KEY = 'report_form_draft'
const SESSION_FALLBACK_KEY = 'fixkh_report_draft_fallback'

// In-memory cache for fast access and test environments without IndexedDB
let inMemoryDraft: ReportDraft | null = null

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported in current environment'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const reportDraftService = {
  async saveDraft(data: Omit<ReportDraft, 'savedAt'>): Promise<void> {
    const draft: ReportDraft = {
      ...data,
      savedAt: Date.now(),
    }

    inMemoryDraft = draft

    // Attempt to persist in IndexedDB (handles large multi-MB photo arrays safely)
    if (typeof indexedDB !== 'undefined') {
      try {
        const db = await openDatabase()
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          const putReq = store.put(draft, DRAFT_KEY)
          putReq.onsuccess = () => resolve()
          putReq.onerror = () => reject(putReq.error)
        })
      } catch (idbErr) {
        console.warn('Could not save draft to IndexedDB; using fallback storage:', idbErr)
      }
    }

    // Fallback: sessionStorage for text fields and photos if size permits
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_FALLBACK_KEY, JSON.stringify(draft))
      }
    } catch {
      // SessionStorage quota exceeded or unavailable; inMemoryDraft handles it
    }
  },

  async getDraft(): Promise<ReportDraft | null> {
    // 1. Try IndexedDB if available
    if (typeof indexedDB !== 'undefined') {
      try {
        const db = await openDatabase()
        const draft = await new Promise<ReportDraft | null>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const getReq = store.get(DRAFT_KEY)
          getReq.onsuccess = () => resolve(getReq.result || null)
          getReq.onerror = () => reject(getReq.error)
        })

        if (draft) {
          inMemoryDraft = draft
          return draft
        }
      } catch (idbErr) {
        console.warn('IndexedDB read failed, falling back:', idbErr)
      }
    }

    // 2. Try in-memory draft
    if (inMemoryDraft) {
      return inMemoryDraft
    }

    // 3. Try sessionStorage fallback
    try {
      if (typeof sessionStorage !== 'undefined') {
        const raw = sessionStorage.getItem(SESSION_FALLBACK_KEY)
        if (raw) {
          const parsed: ReportDraft = JSON.parse(raw)
          inMemoryDraft = parsed
          return parsed
        }
      }
    } catch {
      // ignore
    }

    return null
  },

  async clearDraft(): Promise<void> {
    inMemoryDraft = null

    if (typeof indexedDB !== 'undefined') {
      try {
        const db = await openDatabase()
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          const delReq = store.delete(DRAFT_KEY)
          delReq.onsuccess = () => resolve()
          delReq.onerror = () => reject(delReq.error)
        })
      } catch (idbErr) {
        console.warn('Could not clear IndexedDB draft:', idbErr)
      }
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(SESSION_FALLBACK_KEY)
      }
    } catch {
      // ignore
    }
  },

  async hasDraft(): Promise<boolean> {
    const draft = await this.getDraft()
    return !!draft
  },
}
