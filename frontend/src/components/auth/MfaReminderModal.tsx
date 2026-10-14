import { useEffect, useRef, type KeyboardEvent } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface Props {
  open: boolean
  onClose: () => void
  onSetup: () => void
}

export function MfaReminderModal({ open, onClose, onSetup }: Props) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const setupRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    setupRef.current?.focus()
    return () => previousFocus?.focus()
  }, [open])

  if (!open) return null

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
    if (event.key !== 'Tab') return
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button')
    if (!buttons?.length) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/70 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mfa-reminder-title" aria-describedby="mfa-reminder-description" onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="mfa-reminder-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('mfaReminderTitle')}</h2>
            <p id="mfa-reminder-description" className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t('mfaReminderBody')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-sm border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
            {t('mfaReminderLater')}
          </button>
          <button ref={setupRef} type="button" onClick={onSetup} className="rounded-sm bg-blue-900 dark:bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950 dark:hover:bg-blue-500">
            {t('mfaReminderSetup')}
          </button>
        </div>
      </div>
    </div>
  )
}
