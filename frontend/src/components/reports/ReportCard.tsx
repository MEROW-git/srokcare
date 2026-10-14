import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MapPin,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import type { Report } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { reportService } from '@/services/reportService'
import { Avatar } from '@/components/common/Avatar'
import { ReportStatusBadge } from './ReportStatusBadge'
import { ReportCategoryBadge } from './ReportCategoryBadge'
import { AuthRequiredModal, type AuthRequiredAction } from './AuthRequiredModal'
import { ShareModal } from './ShareModal'
import { formatRelativeTime, hasKhmerText } from '@/lib/utils'
import { reportReturnPath } from '@/lib/reportInteraction'

interface ReportCardProps {
  report: Report
  onReportUpdated?: (updated: Report) => void
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onReportUpdated }) => {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const isKhmerTitle = hasKhmerText(report.title) || language === 'km'
  const isKhmerDesc = hasKhmerText(report.description) || language === 'km'
  const isKhmerAuthor = hasKhmerText(report.authorNickname)

  const [isSupporting, setIsSupporting] = useState(false)
  const [supportedByMe, setSupportedByMe] = useState(report.supportedByMe)
  const [supportCount, setSupportCount] = useState(report.supportCount)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false)

  // Auth & Share Modals
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalAction, setAuthModalAction] = useState<AuthRequiredAction>('support')
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const supportButtonRef = useRef<HTMLButtonElement>(null)
  const commentButtonRef = useRef<HTMLButtonElement>(null)
  const shareButtonRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setSupportedByMe(report.supportedByMe)
    setSupportCount(report.supportCount)
  }, [report.supportedByMe, report.supportCount])

  React.useLayoutEffect(() => {
    const description = descriptionRef.current
    if (!description || isDescriptionExpanded) return

    const updateTruncation = () => {
      setIsDescriptionTruncated(description.scrollHeight > description.clientHeight + 1)
    }
    updateTruncation()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateTruncation)
    observer.observe(description)
    return () => observer.disconnect()
  }, [report.description, isDescriptionExpanded])

  const handleSupportClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Signed-out user: do NOT call API, change count, or show error toast
    if (!user) {
      setAuthModalAction('support')
      setIsSessionExpired(false)
      setAuthModalOpen(true)
      return
    }

    if (isSupporting) return

    const prevSupported = supportedByMe
    const prevCount = supportCount

    // Optimistic toggle
    const nextState = !supportedByMe
    const nextCount = nextState ? supportCount + 1 : Math.max(0, supportCount - 1)
    setSupportedByMe(nextState)
    setSupportCount(nextCount)
    setIsSupporting(true)

    try {
      const res = await reportService.toggleSupport(report.id)
      setSupportCount(res.supportCount)
      setSupportedByMe(res.supportedByMe)
      if (onReportUpdated) {
        onReportUpdated({
          ...report,
          supportCount: res.supportCount,
          supportedByMe: res.supportedByMe,
        })
      }
      if (res.supportedByMe) {
        toast.success(`You supported this issue! (${res.supportCount} supports)`)
      }
    } catch (err: unknown) {
      // Revert on error
      setSupportedByMe(prevSupported)
      setSupportCount(prevCount)
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsSessionExpired(true)
        setAuthModalAction('support')
        setAuthModalOpen(true)
      } else {
        toast.error('Unable to update support. Please try again.')
      }
    } finally {
      setIsSupporting(false)
    }
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setAuthModalAction('comment')
      setIsSessionExpired(false)
      setAuthModalOpen(true)
      return
    }
    navigate(`/reports/${report.id}#comments`)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setAuthModalAction('share')
      setIsSessionExpired(false)
      setAuthModalOpen(true)
      return
    }
    setShareModalOpen(true)
  }

  const handleAuthModalSignIn = () => {
    setAuthModalOpen(false)
    navigate('/login', { state: { from: reportReturnPath(report.id, authModalAction) } })
  }

  const handleAuthModalCreateAccount = () => {
    setAuthModalOpen(false)
    navigate('/register', { state: { from: reportReturnPath(report.id, authModalAction) } })
  }

  const activeTriggerRef =
    authModalAction === 'comment'
      ? commentButtonRef
      : authModalAction === 'share'
      ? shareButtonRef
      : supportButtonRef


  const photos = report.images || []
  const hasMultiplePhotos = photos.length > 1

  return (
    <article className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150 overflow-hidden flex flex-col group">
      {/* Header Info */}
      <div className="p-4 sm:p-5 pb-3.5">
        <div className="flex items-start justify-between gap-3">
          {/* Author & Meta */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/profile/${encodeURIComponent(report.authorNickname)}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <Avatar nickname={report.authorNickname} size="md" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/profile/${encodeURIComponent(report.authorNickname)}`}
                  onClick={(e) => e.stopPropagation()}
                  lang={isKhmerAuthor ? 'km' : undefined}
                  className={`text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:underline hover:text-blue-900 dark:hover:text-blue-400 transition-colors ${
                    isKhmerAuthor ? 'font-khmer tracking-normal' : 'tracking-tight'
                  }`}
                >
                  {report.authorNickname}
                </Link>
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                  {formatRelativeTime(report.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="truncate">
                  {report.district}, {report.province}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            <ReportStatusBadge status={report.status} />
          </div>
        </div>

        {/* Category & Title */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center gap-2">
            <ReportCategoryBadge category={report.category} size="sm" />
          </div>
          <Link to={`/reports/${report.id}`} className="block group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">
            <h3
              lang={isKhmerTitle ? 'km' : undefined}
              className={`text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 ${
                isKhmerTitle
                  ? 'font-khmer tracking-normal leading-[1.6] py-0.5'
                  : 'tracking-tight leading-snug'
              }`}
            >
              {report.title}
            </h3>
          </Link>
          <p
            ref={descriptionRef}
            id={`report-description-${report.id}`}
            lang={isKhmerDesc ? 'km' : undefined}
            className={`text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line ${
              isKhmerDesc
                ? 'font-khmer tracking-normal leading-[1.75] py-0.5'
                : 'leading-relaxed'
            } ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}
          >
            {report.description}
          </p>
          {(isDescriptionTruncated || isDescriptionExpanded) && (
            <button
              type="button"
              aria-controls={`report-description-${report.id}`}
              aria-expanded={isDescriptionExpanded}
              onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
              lang={language === 'km' ? 'km' : undefined}
              className="text-xs font-bold text-blue-800 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-300 hover:underline tracking-normal py-0.5"
            >
              {isDescriptionExpanded
                ? (language === 'km' ? 'បង្ហាញតិច' : 'Read less')
                : (language === 'km' ? 'អានបន្ថែម' : 'Read more')}
            </button>
          )}
        </div>
      </div>

      {/* Photo Gallery / Preview */}
      {photos.length > 0 && (
        <div className="relative px-4 sm:px-5 pb-3.5">
          <Link
            to={`/reports/${report.id}`}
            className="block relative rounded-xs overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-16/9 border border-slate-200 dark:border-slate-800 group/img"
          >
            <img
              src={photos[activePhotoIdx] || photos[0]}
              alt={report.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover/img:scale-101 transition-transform duration-200"
            />
            {hasMultiplePhotos && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-xs bg-slate-900/85 text-white text-[11px] font-mono font-semibold flex items-center gap-1 border border-slate-700">
                <ImageIcon className="w-3 h-3" />
                <span>
                  {activePhotoIdx + 1}/{photos.length}
                </span>
              </div>
            )}
          </Link>

          {/* Multiple Photo Thumbnails Tabs */}
          {hasMultiplePhotos && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActivePhotoIdx(idx)
                  }}
                  className={`h-1.5 transition-all rounded-xs ${
                    idx === activePhotoIdx
                      ? 'w-5 bg-blue-800 dark:bg-blue-500'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="mt-auto px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Support Button */}
          <button
            ref={supportButtonRef}
            onClick={handleSupportClick}
            disabled={isSupporting}
            aria-label={`${supportedByMe ? t('supported') : t('support')} (${supportCount})`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border ${
              supportedByMe
                ? 'bg-blue-800 dark:bg-blue-600 text-white border-blue-950 dark:border-blue-500'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Support this report to increase visibility"
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${
                supportedByMe ? 'fill-white stroke-white' : 'stroke-current'
              }`}
            />
            <span>{supportCount}</span>
            <span className="hidden sm:inline font-semibold">
              {supportedByMe ? t('supported') : t('support')}
            </span>
          </button>

          {/* Comments Button */}
          <button
            ref={commentButtonRef}
            type="button"
            onClick={handleCommentClick}
            aria-label={`${t('comments')} (${report.commentCount})`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{report.commentCount}</span>
            <span className="hidden sm:inline font-semibold">{t('comments')}</span>
          </button>

          {/* Share Button */}
          <button
            ref={shareButtonRef}
            type="button"
            onClick={handleShareClick}
            aria-label={t('share')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
            title="Share report"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline font-semibold">{t('share')}</span>
          </button>
        </div>

        {/* View Details Link */}
        <Link
          to={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-300 transition-colors"
        >
          <span>{t('viewDetails')}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Guest Authentication Modal */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        isSessionExpired={isSessionExpired}
        action={authModalAction}
        onClose={() => {
          setAuthModalOpen(false)
          setIsSessionExpired(false)
        }}
        onSignIn={handleAuthModalSignIn}
        onCreateAccount={handleAuthModalCreateAccount}
        triggerRef={activeTriggerRef}
      />

      {/* Share Dialog */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        report={report}
        triggerRef={shareButtonRef}
      />
    </article>
  )
}
