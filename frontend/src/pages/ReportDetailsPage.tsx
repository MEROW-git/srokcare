import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Share2,
  MapPin,
  Calendar,
  Send,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import * as maplibregl from 'maplibre-gl'
import type { Report } from '@/types/report'
import type { Comment } from '@/types/comment'
import { reportService } from '@/services/reportService'
import { commentService } from '@/services/commentService'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'
import { formatRelativeTime } from '@/lib/utils'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'
import { MapStyleToggle } from '@/components/map/MapStyleToggle'
import { SatelliteAttribution } from '@/components/map/SatelliteAttribution'
import { attachSatelliteFallback, getMapStyle } from '@/lib/mapStyle'
import type { MapMode } from '@/lib/mapStyle'

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()

  const [report, setReport] = useState<Report | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [mapMode, setMapMode] = useState<MapMode>('road')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const mapModeRef = useRef<MapMode>('road')

  // Fetch report and its comments
  const loadReportData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [repData, cmtData] = await Promise.all([
        reportService.getReportById(id),
        commentService.getComments(id),
      ])
      setReport(repData)
      setComments(cmtData)
    } catch (err) {
      console.error(err)
      toast.error('Report not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [id])

  // Mini-map setup for report coordinates
  useEffect(() => {
    if (!report || !mapContainerRef.current) return

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapStyle(mapModeRef.current),
        center: [report.longitude, report.latitude],
        zoom: 14,
        interactive: true,
      })

      attachSatelliteFallback(map, () => {
        mapModeRef.current = 'road'
        setMapMode('road')
        toast.error('Satellite imagery is unavailable. Showing the road map.')
      })

      const markerEl = document.createElement('div')
      const markerRing = 'border-white shadow-md'
      markerEl.className = `w-7 h-7 rounded-xs bg-blue-900 dark:bg-blue-600 border-2 ${markerRing} text-amber-400 flex items-center justify-center`
      markerEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      `

      new maplibregl.Marker({ element: markerEl })
        .setLngLat([report.longitude, report.latitude])
        .addTo(map)

      mapRef.current = map

      return () => {
        map.remove()
        if (mapRef.current === map) mapRef.current = null
      }
    } catch (err) {
      console.warn('Map initialization failed:', err)
    }
  }, [report])

  const handleMapModeChange = (mode: MapMode) => {
    if (mode === mapMode) return
    mapModeRef.current = mode
    mapRef.current?.setStyle(getMapStyle(mode))
    setMapMode(mode)
  }

  const handleSupportToggle = async () => {
    if (!report) return
    try {
      const res = await reportService.toggleSupport(report.id)
      setReport({
        ...report,
        supportCount: res.supportCount,
        supportedByMe: res.supportedByMe,
      })
      if (res.supportedByMe) {
        toast.success(`You supported this issue! (${res.supportCount} total)`)
      }
    } catch {
      toast.error('Unable to update support.')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t('shareCopied'))
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !report || !user) return

    setIsSubmittingComment(true)
    try {
      const added = await commentService.addComment(report.id, newComment.trim(), user)
      setComments((prev) => [...prev, added])
      setReport({ ...report, commentCount: report.commentCount + 1 })
      setNewComment('')
      toast.success('Comment added to discussion!')
    } catch {
      toast.error('Failed to post comment.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Report Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This civic issue report may have been deleted or moved.</p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 dark:bg-blue-600 text-white rounded-sm text-xs font-semibold"
        >
          {t('backToFeed')}
        </Link>
      </div>
    )
  }

  const photos = report.images || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 transition-colors duration-150">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-900 px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-800 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToFeed')}</span>
        </button>

        <div className="flex items-center gap-2">
          <ReportStatusBadge status={report.status} />
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Main Report Container */}
      <article className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header Details */}
        <div className="p-6 sm:p-7 space-y-3.5">
          <div className="flex items-center gap-2">
            <ReportCategoryBadge category={report.category} />
            <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {t('postedOn')} {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
            {report.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3 pt-1">
            <Avatar nickname={report.authorNickname} size="md" />
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{report.authorNickname}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>
                  {report.district}, {report.province}
                  {report.address ? ` (${report.address})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery / Main View */}
        {photos.length > 0 && (
          <div className="border-y border-slate-200 dark:border-slate-800 bg-slate-950">
            <div className="relative aspect-16/9 max-h-[460px] overflow-hidden flex items-center justify-center">
              <img
                src={photos[activePhotoIdx] || photos[0]}
                alt={report.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail selector */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 p-2.5 bg-slate-900 border-t border-slate-800 overflow-x-auto">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-14 h-14 rounded-xs overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activePhotoIdx ? 'border-amber-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description Body */}
        <div className="p-6 sm:p-7 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-mono">
              PROBLEM DESCRIPTION
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {report.description}
            </p>
          </div>

          {/* Location Map Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                GEOGRAPHIC LOCATION
              </h3>
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-xs border border-slate-200 dark:border-slate-700">
                {report.latitude.toFixed(5)}° N, {report.longitude.toFixed(5)}° E
              </span>
            </div>
            <div className="relative h-60 rounded-xs overflow-hidden border border-slate-300 dark:border-slate-800">
              <div ref={mapContainerRef} className="w-full h-full" />
              <MapStyleToggle mode={mapMode} onChange={handleMapModeChange} />
              <SatelliteAttribution mode={mapMode} />
            </div>
          </div>

          {/* Action Support & Share Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSupportToggle}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-xs transition-colors border ${
                  report.supportedByMe
                    ? 'bg-blue-900 dark:bg-blue-600 border-blue-950 dark:border-blue-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${report.supportedByMe ? 'fill-white stroke-white' : ''}`} />
                <span>
                  {report.supportedByMe ? t('supported') : t('support')} ({report.supportCount})
                </span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm font-semibold text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{t('share')}</span>
              </button>
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {comments.length} {t('comments').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments" className="bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-7 border-t border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Community Discussion ({comments.length})
            </h3>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-300 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Commenting as</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{user.nickname}</span>
              </div>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('commentPlaceholder')}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-blue-500 outline-hidden transition-colors text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-bold bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-colors uppercase tracking-wider border border-blue-950 dark:border-blue-500"
                >
                  <Send className="w-3 h-3" />
                  <span>{t('postComment')}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-sm border border-slate-300 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
              Please{' '}
              <Link to="/login" className="text-blue-700 dark:text-blue-400 font-bold underline">
                sign in
              </Link>{' '}
              to participate in the community discussion.
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-2.5">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-5">
                {t('noCommentsYet')}
              </p>
            ) : (
              comments.map((cmt) => (
                <div key={cmt.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-2xs flex gap-3">
                  <Avatar nickname={cmt.authorNickname} size="sm" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cmt.authorNickname}</span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(cmt.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{cmt.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
