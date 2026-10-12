import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MapPin,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Report } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { reportService } from '@/services/reportService'
import { Avatar } from '@/components/common/Avatar'
import { ReportStatusBadge } from './ReportStatusBadge'
import { ReportCategoryBadge } from './ReportCategoryBadge'
import { formatRelativeTime } from '@/lib/utils'

interface ReportCardProps {
  report: Report
  onReportUpdated?: (updated: Report) => void
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onReportUpdated }) => {
  const { t } = useTranslation()
  const [isSupporting, setIsSupporting] = useState(false)
  const [supportedByMe, setSupportedByMe] = useState(report.supportedByMe)
  const [supportCount, setSupportCount] = useState(report.supportCount)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  const handleSupportClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSupporting) return

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
    } catch {
      // Revert on error
      setSupportedByMe(report.supportedByMe)
      setSupportCount(report.supportCount)
      toast.error('Unable to update support. Please try again.')
    } finally {
      setIsSupporting(false)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/reports/${report.id}`
    navigator.clipboard.writeText(url)
    toast.success(t('shareCopied'))
  }

  const photos = report.images || []
  const hasMultiplePhotos = photos.length > 1

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Header Info */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Author & Meta */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar nickname={report.authorNickname} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {report.authorNickname}
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  {formatRelativeTime(report.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <ReportCategoryBadge category={report.category} size="sm" />
          </div>
          <Link to={`/reports/${report.id}`} className="block group-hover:text-blue-600 transition-colors">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-2">
              {report.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      {/* Photo Gallery / Preview */}
      {photos.length > 0 && (
        <div className="relative px-4 sm:px-5 pb-3">
          <Link
            to={`/reports/${report.id}`}
            className="block relative rounded-xl overflow-hidden bg-slate-100 aspect-16/9 group/img"
          >
            <img
              src={photos[activePhotoIdx] || photos[0]}
              alt={report.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300"
            />
            {hasMultiplePhotos && (
              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md bg-slate-900/70 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>
                  {activePhotoIdx + 1} / {photos.length}
                </span>
              </div>
            )}
          </Link>

          {/* Multiple Photo Thumbnails Dots */}
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
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activePhotoIdx
                      ? 'w-4 bg-blue-600'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="mt-auto px-4 sm:px-5 py-3 border-t border-slate-100/90 flex items-center justify-between gap-2 bg-slate-50/40">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Support Button */}
          <button
            onClick={handleSupportClick}
            disabled={isSupporting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              supportedByMe
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'bg-slate-100/90 hover:bg-blue-50 text-slate-700 hover:text-blue-600'
            }`}
            title="Support this report to increase visibility"
          >
            <ThumbsUp
              className={`w-4 h-4 ${
                supportedByMe ? 'fill-white stroke-white' : 'stroke-current'
              }`}
            />
            <span>{supportCount}</span>
            <span className="hidden sm:inline font-normal">
              {supportedByMe ? t('supported') : t('support')}
            </span>
          </button>

          {/* Comments Button */}
          <Link
            to={`/reports/${report.id}#comments`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{report.commentCount}</span>
            <span className="hidden sm:inline font-normal">{t('comments')}</span>
          </Link>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Share report link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline font-normal">{t('share')}</span>
          </button>
        </div>

        {/* View Details Link */}
        <Link
          to={`/reports/${report.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>{t('viewDetails')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  )
}
