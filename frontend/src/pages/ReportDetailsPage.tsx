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

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

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
        style: {
          version: 8,
          sources: {
            'carto-voyager': {
              type: 'raster',
              tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap &copy; CARTO',
            },
          },
          layers: [
            {
              id: 'carto-voyager-layer',
              type: 'raster',
              source: 'carto-voyager',
              minzoom: 0,
              maxzoom: 20,
            },
          ],
        },
        center: [report.longitude, report.latitude],
        zoom: 14,
        interactive: true,
      })

      const markerEl = document.createElement('div')
      markerEl.className = 'w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-lg'
      markerEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
      }
    } catch (err) {
      console.warn('Map initialization failed:', err)
    }
  }, [report])

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-md" />
        <div className="h-10 w-3/4 bg-slate-200 rounded-lg" />
        <div className="h-80 bg-slate-200 rounded-2xl" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
        <p className="text-sm text-slate-500">This civic issue report may have been deleted or moved.</p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          {t('backToFeed')}
        </Link>
      </div>
    )
  }

  const photos = report.images || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToFeed')}</span>
        </button>

        <div className="flex items-center gap-2">
          <ReportStatusBadge status={report.status} />
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Main Report Container */}
      <article className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header Details */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ReportCategoryBadge category={report.category} />
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {t('postedOn')} {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {report.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3 pt-2">
            <Avatar nickname={report.authorNickname} size="md" />
            <div>
              <div className="text-sm font-bold text-slate-900">{report.authorNickname}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
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
          <div className="border-y border-slate-100 bg-slate-900/5">
            <div className="relative aspect-16/9 max-h-[460px] overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={photos[activePhotoIdx] || photos[0]}
                alt={report.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail selector */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 overflow-x-auto">
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activePhotoIdx ? 'border-blue-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
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
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Problem Description
            </h3>
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {report.description}
            </p>
          </div>

          {/* Location Map Preview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Exact Location
            </h3>
            <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-200">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
                {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
              </div>
            </div>
          </div>

          {/* Action Support & Share Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSupportToggle}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all ${
                  report.supportedByMe
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${report.supportedByMe ? 'fill-white stroke-white' : ''}`} />
                <span>
                  {report.supportedByMe ? t('supported') : t('support')} ({report.supportCount})
                </span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>{t('share')}</span>
              </button>
            </div>

            <div className="text-xs font-medium text-slate-400">
              {comments.length} {t('comments')}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments" className="bg-slate-50/60 p-6 sm:p-8 border-t border-slate-100 space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Community Discussion ({comments.length})
            </h3>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Commenting as</span>
                <span className="font-bold text-slate-800">{user.nickname}</span>
              </div>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('commentPlaceholder')}
                className="w-full p-3 text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all text-slate-800"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('postComment')}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
              Please{' '}
              <Link to="/login" className="text-blue-600 font-bold underline">
                sign in
              </Link>{' '}
              to participate in the community discussion.
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                {t('noCommentsYet')}
              </p>
            ) : (
              comments.map((cmt) => (
                <div key={cmt.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-3">
                  <Avatar nickname={cmt.authorNickname} size="sm" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{cmt.authorNickname}</span>
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(cmt.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{cmt.content}</p>
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
