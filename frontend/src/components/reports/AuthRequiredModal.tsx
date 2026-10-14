import React, { useEffect, useRef } from 'react'
import { LogIn, UserPlus, CheckCircle2, X, ThumbsUp, MessageSquare, Share2 } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { hasKhmerText } from '@/lib/utils'

export type AuthRequiredAction = 'publish' | 'support' | 'comment' | 'share'

export interface AuthRequiredModalProps {
  isOpen: boolean
  isSessionExpired?: boolean
  action?: AuthRequiredAction
  onClose: () => void
  onSignIn: () => void
  onCreateAccount: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  isSessionExpired = false,
  action = 'publish',
  onClose,
  onSignIn,
  onCreateAccount,
  triggerRef,
}) => {
  const { t, language } = useTranslation()
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

  // Action-specific icon, title, prompt, and guarantee notice
  let HeaderIcon = LogIn
  let titleText = t('authRequiredTitle')
  let promptText = t('authRequiredPrompt')
  let noticeHeading = 'Draft & photos preserved:'
  let noticeText = t('authRequiredDraftNotice')

  if (isSessionExpired) {
    titleText = t('sessionExpiredTitle')
    promptText = action === 'publish' ? t('sessionExpiredNotice') : t('sessionExpiredNoticeAction')
  } else if (action === 'support') {
    HeaderIcon = ThumbsUp
    titleText = t('authRequiredSupportTitle')
    promptText = t('authRequiredSupportPrompt')
    noticeHeading = language === 'km' ? 'ការគាំទ្រដោយអនាមិក៖' : 'Pseudonymous support:'
    noticeText = t('authRequiredSupportNotice')
  } else if (action === 'comment') {
    HeaderIcon = MessageSquare
    titleText = t('authRequiredCommentTitle')
    promptText = t('authRequiredCommentPrompt')
    noticeHeading = language === 'km' ? 'ការពិភាក្សាសហគមន៍៖' : 'Community discussion:'
    noticeText = t('authRequiredCommentNotice')
  } else if (action === 'share') {
    HeaderIcon = Share2
    titleText = t('authRequiredShareTitle')
    promptText = t('authRequiredSharePrompt')
    noticeHeading = language === 'km' ? 'ការយល់ដឹងជាសាធារណៈ៖' : 'Civic awareness:'
    noticeText = t('authRequiredShareNotice')
  }

  const isKhmerTitle = hasKhmerText(titleText) || language === 'km'
  const isKhmerPrompt = hasKhmerText(promptText) || language === 'km'
  const isKhmerNotice = hasKhmerText(noticeText) || language === 'km'

  const cancelLabel = action === 'publish' && !isSessionExpired
    ? t('authKeepEditingBtn')
    : t('cancel')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
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
              <HeaderIcon className="w-4 h-4" />
            </div>
            <h2
              id="auth-modal-title"
              lang={isKhmerTitle ? 'km' : undefined}
              className={`text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-white ${
                isKhmerTitle ? 'font-khmer tracking-normal leading-[1.6]' : 'tracking-tight'
              }`}
            >
              {titleText}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={cancelLabel}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <p
            lang={isKhmerPrompt ? 'km' : undefined}
            className={`text-sm text-slate-800 dark:text-slate-200 font-semibold ${
              isKhmerPrompt ? 'font-khmer tracking-normal leading-[1.75]' : 'leading-relaxed'
            }`}
          >
            {promptText}
          </p>

          {/* Guarantee / Context notice */}
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xs flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div
              lang={isKhmerNotice ? 'km' : undefined}
              className={isKhmerNotice ? 'font-khmer tracking-normal leading-[1.65]' : 'leading-relaxed'}
            >
              <span className="font-bold">{noticeHeading} </span>
              <span>{noticeText}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCreateAccount}
              lang={language === 'km' ? 'km' : undefined}
              className={`min-h-10 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xs border border-blue-800 dark:border-blue-500 transition-colors text-center ${
                language === 'km' ? 'font-khmer tracking-normal' : 'tracking-wider'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>{t('authCreateAccountBtn')}</span>
            </button>

            <button
              ref={signInButtonRef}
              type="button"
              onClick={onSignIn}
              lang={language === 'km' ? 'km' : undefined}
              className={`min-h-10 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors shadow-2xs border border-blue-950 dark:border-blue-400 text-center ${
                language === 'km' ? 'font-khmer tracking-normal' : 'tracking-wider'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span>{t('authSignInBtn')}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            lang={language === 'km' ? 'km' : undefined}
            className={`block mx-auto mt-3 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:underline transition-colors text-center ${
              language === 'km' ? 'font-khmer tracking-normal py-0.5' : ''
            }`}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
