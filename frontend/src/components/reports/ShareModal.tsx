import React, { useEffect, useRef, useState } from 'react'
import { Share2, Copy, Check, Smartphone, X, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Report } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { ReportCategoryBadge } from './ReportCategoryBadge'
import { hasKhmerText } from '@/lib/utils'
import { facebookShareUrl, reportPublicUrl } from '@/lib/reportInteraction'

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)


export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  report: Report
  triggerRef?: React.RefObject<HTMLElement | null>
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  report,
  triggerRef,
}) => {
  const { t, language } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const copyButtonRef = useRef<HTMLButtonElement>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [copied, setCopied] = useState(false)

  const publicUrl = reportPublicUrl(report.id, window.location.origin)

  const canShareDevice = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = (triggerRef?.current || document.activeElement) as HTMLElement | null
      const timer = setTimeout(() => {
        copyButtonRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
      setCopied(false)
    }
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, [isOpen, triggerRef])

  // Keyboard navigation: Escape to close, Tab focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  const handleCopyLink = async () => {
    let success = false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicUrl)
        success = true
      } else {
        // Fallback using temporary textarea
        const textArea = document.createElement('textarea')
        textArea.value = publicUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        try {
          textArea.focus()
          textArea.select()
          success = document.execCommand('copy')
        } finally {
          textArea.remove()
        }
      }
    } catch {
      success = false
    }

    if (success) {
      setCopied(true)
      toast.success(t('shareCopiedSuccess'))
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2500)
    } else {
      toast.error(t('shareCopyFailed'))
    }
  }

  const handleFacebookShare = () => {
    window.open(facebookShareUrl(publicUrl), '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const handleDeviceShare = async () => {
    if (!canShareDevice) return
    try {
      await navigator.share({
        title: report.title,
        text: `FixKH Civic Report: ${report.title} (${report.province})`,
        url: publicUrl,
      })
    } catch (err: unknown) {
      // AbortError is triggered when user cancels or dismisses native share sheet; do not show error toast
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error(t('shareDeviceFailed'))
    }
  }

  if (!isOpen) return null

  const isKhmerTitle = hasKhmerText(report.title) || language === 'km'
  const isKhmerModalTitle = hasKhmerText(t('shareModalTitle')) || language === 'km'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
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
              <Share2 className="w-4 h-4" />
            </div>
            <h2
              id="share-modal-title"
              lang={isKhmerModalTitle ? 'km' : undefined}
              className={`text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-white ${
                isKhmerModalTitle ? 'font-khmer tracking-normal leading-[1.6]' : 'tracking-tight'
              }`}
            >
              {t('shareModalTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            title={t('cancel')}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Preview Snippet */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">{t('shareModalSubtitle')}</p>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xs border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <ReportCategoryBadge category={report.category} size="sm" />
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{report.district}, {report.province}</span>
              </div>
            </div>
            <h3
              lang={isKhmerTitle ? 'km' : undefined}
              className={`text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 ${
                isKhmerTitle ? 'font-khmer tracking-normal leading-[1.6] py-0.5' : 'tracking-tight leading-snug'
              }`}
            >
              {report.title}
            </h3>
          </div>

          {/* Direct Link Input with Copy button */}
          <div className="space-y-1.5">
            <label htmlFor="report-share-url" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t('shareDirectLink')}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="report-share-url"
                type="text"
                readOnly
                value={publicUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-800 dark:text-slate-200 select-all outline-hidden focus:border-blue-700 dark:focus:border-blue-400"
              />
              <button
                ref={copyButtonRef}
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors shadow-2xs border border-blue-950 dark:border-blue-400"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'km' ? 'បានចម្លង' : 'Copied') : t('shareCopyLink')}</span>
              </button>
            </div>
          </div>

          {/* Social / Native Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Share to Facebook */}
            <button
              type="button"
              onClick={handleFacebookShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 rounded-xs transition-colors"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>{t('shareToFacebook')}</span>
            </button>

            {/* Share via Device (Web Share API) */}
            {canShareDevice && (
              <button
                type="button"
                onClick={handleDeviceShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-blue-800 dark:border-blue-500 rounded-xs transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>{t('shareViaDevice')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xs hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
