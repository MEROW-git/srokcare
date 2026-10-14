import React, { useEffect, useRef } from 'react'
import { LogIn, UserPlus, CheckCircle2, X } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface AuthRequiredModalProps {
  isOpen: boolean
  isSessionExpired?: boolean
  onClose: () => void
  onSignIn: () => void
  onCreateAccount: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  isSessionExpired = false,
  onClose,
  onSignIn,
  onCreateAccount,
  triggerRef,
}) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const signInButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management: save previous focus, focus modal on open, restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = (triggerRef?.current || document.activeElement) as HTMLElement | null
      const timer = setTimeout(() => {
        signInButtonRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen, triggerRef])

  // Keyboard navigation: Escape key to close, Tab key focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-xl max-w-md w-full overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-400 rounded-xs border border-blue-200 dark:border-blue-900">
              <LogIn className="w-4 h-4" />
            </div>
            <h2
              id="auth-modal-title"
              className="text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-white"
            >
              {t('authRequiredTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={t('authKeepEditingBtn')}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
            {isSessionExpired ? t('sessionExpiredNotice') : t('authRequiredPrompt')}
          </p>

          {/* Draft preservation guarantee notice */}
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xs flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Draft & photos preserved: </span>
              <span>{t('authRequiredDraftNotice')}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="order-3 sm:order-1 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xs border border-slate-300 dark:border-slate-700 transition-colors text-center"
          >
            {t('authKeepEditingBtn')}
          </button>

          <button
            type="button"
            onClick={onCreateAccount}
            className="order-2 sm:order-2 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xs border border-blue-800 dark:border-blue-500 transition-colors text-center"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('authCreateAccountBtn')}</span>
          </button>

          <button
            ref={signInButtonRef}
            type="button"
            onClick={onSignIn}
            className="order-1 sm:order-3 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors shadow-2xs border border-blue-950 dark:border-blue-400 text-center"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{t('authSignInBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
