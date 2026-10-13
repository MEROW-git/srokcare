import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Camera,
  Edit3,
  Calendar,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Trash2,
  PlusCircle,
  ChevronRight,
  Shield,
  FolderOpen,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/LanguageContext'
import { userService } from '@/services/userService'
import { reportService } from '@/services/reportService'
import { Avatar } from '@/components/common/Avatar'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'
import { EmptyState } from '@/components/common/EmptyState'
import type { Report } from '@/types/report'
import type { PublicProfile } from '@/types/auth'

const REPORTS_PAGE_SIZE = 20

export const ProfilePage: React.FC = () => {
  const { identifier } = useParams<{ identifier?: string }>()
  const { user, isAuthenticated, updateUser } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextPage, setNextPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [editBio, setEditBio] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // File uploads
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Determine if viewing own profile
  const isOwnProfile =
    !identifier ||
    (user &&
      (user.nickname.toLowerCase() === identifier.toLowerCase() ||
        user.id.toLowerCase() === identifier.toLowerCase()))

  const loadProfileData = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isOwnProfile && user) {
        const [publicProfile, myReports] = await Promise.all([
          userService.getPublicProfile(user.id),
          reportService.getMyReports(user.id, user.nickname, 0, REPORTS_PAGE_SIZE),
        ])
        const seen = new Set<string>()
        const uniqueReports = myReports.filter((r) => !seen.has(r.id) && seen.add(r.id))
        setReports(uniqueReports)
        setProfile(publicProfile)
        setNextPage(1)
        setHasMore(myReports.length === REPORTS_PAGE_SIZE && uniqueReports.length < publicProfile.totalReports)
      } else if (identifier) {
        const [pub, pubReports] = await Promise.all([
          userService.getPublicProfile(identifier),
          userService.getPublicReports(identifier, 0, REPORTS_PAGE_SIZE),
        ])
        setProfile(pub)
        setReports(pubReports)
        setNextPage(1)
        setHasMore(pubReports.length === REPORTS_PAGE_SIZE && pubReports.length < pub.totalReports)
      }
    } catch (err: unknown) {
      console.error('Failed to load profile:', err)
      setError(t('profileNotFound'))
    } finally {
      setLoading(false)
    }
  }, [identifier, isOwnProfile, user, t])

  useEffect(() => {
    // If accessing /profile directly while logged out, redirect to login
    if (!identifier && !isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    loadProfileData()
  }, [identifier, isAuthenticated, navigate, loadProfileData])

  const loadMoreReports = async () => {
    if (loadingMore || !hasMore || !profile) return
    setLoadingMore(true)
    try {
      const more = isOwnProfile && user
        ? await reportService.getMyReports(user.id, user.nickname, nextPage, REPORTS_PAGE_SIZE)
        : await userService.getPublicReports(identifier!, nextPage, REPORTS_PAGE_SIZE)
      const seen = new Set(reports.map((report) => report.id))
      const combined = [...reports, ...more.filter((report) => !seen.has(report.id) && seen.add(report.id))]
      setReports(combined)
      setNextPage(nextPage + 1)
      setHasMore(more.length === REPORTS_PAGE_SIZE && combined.length < profile.totalReports)
    } catch {
      toast.error('Could not load more reports. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }

  // Handle image validations
  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast.error(t('profileImageInvalid'))
      return false
    }
    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      toast.error(t('profileImageTooLarge'))
      return false
    }
    return true
  }

  // Upload Avatar
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !validateFile(file)) return

    setIsUploadingAvatar(true)
    try {
      const updatedUser = await userService.uploadAvatar(file)
      updateUser(updatedUser)
      setProfile((prev) => (prev ? { ...prev, avatarUrl: updatedUser.avatarUrl } : null))
      toast.success('Avatar updated successfully')
    } catch {
      toast.error('Failed to update avatar photo')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true)
    try {
      const updatedUser = await userService.removeAvatar()
      updateUser(updatedUser)
      setProfile((prev) => (prev ? { ...prev, avatarUrl: undefined } : null))
      toast.success('Avatar removed')
    } catch {
      toast.error('Failed to remove avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Upload Cover
  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !validateFile(file)) return

    setIsUploadingCover(true)
    try {
      const updatedUser = await userService.uploadCover(file)
      updateUser(updatedUser)
      setProfile((prev) => (prev ? { ...prev, coverUrl: updatedUser.coverUrl } : null))
      toast.success('Cover photo updated successfully')
    } catch {
      toast.error('Failed to update cover photo')
    } finally {
      setIsUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  // Remove Cover
  const handleRemoveCover = async () => {
    setIsUploadingCover(true)
    try {
      const updatedUser = await userService.removeCover()
      updateUser(updatedUser)
      setProfile((prev) => (prev ? { ...prev, coverUrl: undefined } : null))
      toast.success('Cover photo removed')
    } catch {
      toast.error('Failed to remove cover photo')
    } finally {
      setIsUploadingCover(false)
    }
  }

  // Open Edit Modal
  const handleOpenEdit = () => {
    if (!profile) return
    setEditNickname(profile.nickname)
    setEditBio(profile.bio || '')
    setEditError(null)
    setIsEditModalOpen(true)
  }

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)

    const trimmed = editNickname.trim()
    if (trimmed.length < 2 || trimmed.length > 50) {
      setEditError('Nickname must be between 2 and 50 characters.')
      return
    }

    if (editBio.length > 500) {
      setEditError('Bio must not exceed 500 characters.')
      return
    }

    setIsSavingProfile(true)
    try {
      const updatedUser = await userService.updateProfile({
        nickname: trimmed,
        bio: editBio.trim(),
      })
      updateUser(updatedUser)
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nickname: updatedUser.nickname,
              bio: updatedUser.bio,
            }
          : null
      )
      setIsEditModalOpen(false)
      toast.success(t('profileEditSuccess'))
    } catch (err: unknown) {
      const errRes = err as { response?: { data?: { message?: string } } }
      const msg = errRes?.response?.data?.message || t('profileEditError')
      setEditError(msg)
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Formatter for date
  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return 'September 2026'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Status breakdown counts
  const totalCount = profile?.totalReports ?? 0
  const resolvedCount = profile?.resolvedReports ?? 0
  const inProgressCount = profile?.activeReports ?? 0

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-blue-900 dark:border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {t('profileLoading')}
        </p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm text-center">
          <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
            {t('profileNotFound')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
            The citizen profile you are looking for does not exist or may have changed their nickname.
          </p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors"
          >
            <span>{t('profileBackToFeed')}</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Hidden file inputs for avatar and cover */}
      {isOwnProfile && (
        <>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarSelect}
            accept="image/jpeg,image/png"
            className="hidden"
          />
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverSelect}
            accept="image/jpeg,image/png"
            className="hidden"
          />
        </>
      )}

      {/* Main Profile Header Container */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-2xs">
        <div className="max-w-5xl mx-auto">
          {/* COVER AREA */}
          <div className="relative w-full h-48 sm:h-72 md:h-80 bg-slate-800 overflow-hidden border-b border-slate-300 dark:border-slate-800 group">
            {profile.coverUrl ? (
              <img
                src={profile.coverUrl}
                alt="Profile cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center relative">
                {/* Subtle Civic Geometric Motif */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center z-10 px-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-xs text-[11px] font-bold uppercase tracking-widest text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>FixKH Civic Community</span>
                  </div>
                </div>
              </div>
            )}

            {/* Own Profile: Cover Action Buttons */}
            {isOwnProfile && (
              <div className="absolute top-3 right-3 sm:bottom-4 sm:top-auto flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xs backdrop-blur-xs border border-white/20 hover:border-white/40 shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isUploadingCover ? 'Uploading...' : t('profileCoverChange')}</span>
                </button>
                {profile.coverUrl && (
                  <button
                    type="button"
                    disabled={isUploadingCover}
                    onClick={handleRemoveCover}
                    title={t('profileCoverRemove')}
                    className="p-1.5 bg-slate-900/80 hover:bg-rose-900 text-white hover:text-white rounded-xs backdrop-blur-xs border border-white/20 hover:border-rose-500 shadow-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* IDENTITY & AVATAR AREA */}
          <div className="px-4 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Overlapping Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="relative group/avatar shrink-0">
                  <div className="p-1 bg-white dark:bg-slate-900 rounded-sm shadow-md border border-slate-300 dark:border-slate-800">
                    <Avatar
                      nickname={profile.nickname}
                      avatarUrl={profile.avatarUrl}
                      size="3xl"
                      className="border-2 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  {isOwnProfile && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                        title={t('profileAvatarChange')}
                        className="p-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xs border border-blue-700 shadow-sm transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      {profile.avatarUrl && (
                        <button
                          type="button"
                          disabled={isUploadingAvatar}
                          onClick={handleRemoveAvatar}
                          title={t('profileAvatarRemove')}
                          className="p-2 bg-slate-900/90 hover:bg-rose-900 text-white rounded-xs border border-slate-700 shadow-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Nickname, Role, Join Date */}
                <div className="pt-2 sm:pt-0 sm:pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                      {profile.nickname}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xs">
                      {profile.role === 'ADMIN' ? (
                        <>
                          <Shield className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>{t('profileRoleAdmin')}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{t('profileRoleCitizen')}</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
                      <span>{t('profileJoined')}: {formatJoinedDate(profile.createdAt)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('profilePublicBadge')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('profileEdit')}</span>
                    </button>
                    <Link
                      to="/settings"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('navSettings')}</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xs transition-colors"
                  >
                    <span>{t('profileBackToFeed')}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* BIO CARD */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('profileBio')}
                  </p>
                  {profile.bio ? (
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                      {isOwnProfile
                        ? 'You have not added a bio yet. Click "Edit Profile" to share your civic focus.'
                        : t('profileEmptyBio')}
                    </p>
                  )}
                </div>

                {/* Privacy Guarantee Note */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xs text-[11px] text-slate-600 dark:text-slate-400 max-w-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="leading-tight">{t('profilePrivateNotice')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        {/* STATS METRIC TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('profileTotalReports')}
              </span>
              <FileText className="w-4 h-4 text-blue-900 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-white">
              {totalCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Public civic submissions
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('profileResolvedReports')}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {resolvedCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Confirmed civic resolutions
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Under Review / Active
              </span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
              {inProgressCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Ongoing community tracking
            </div>
          </div>
        </div>

        {/* ACTIVITY SECTION: REPORTS TIMELINE / GRID */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-2xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white uppercase tracking-wider">
                {t('profileActivity')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Civic reporting timeline submitted by {profile.nickname}
              </p>
            </div>

            {isOwnProfile && (
              <Link
                to="/reports/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('ctaReport')}</span>
              </Link>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={<FolderOpen className="w-6 h-6 text-slate-700 dark:text-slate-300" />}
                title={t('profileNoReports')}
                description={
                  isOwnProfile
                    ? 'Submit your first report to document public issues in your community.'
                    : 'This citizen has not published any public reports yet.'
                }
                actionLabel={isOwnProfile ? t('ctaReport') : undefined}
                onAction={isOwnProfile ? () => navigate('/reports/new') : undefined}
              />
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  to={`/reports/${report.id}`}
                  className="group block p-4 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800 hover:border-blue-900 dark:hover:border-blue-500 rounded-xs transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ReportCategoryBadge category={report.category} />
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 line-clamp-1 mb-1 transition-colors">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{report.district || report.province}</span>
                    </span>

                    <span className="flex items-center gap-1 text-blue-900 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>{t('profileViewReport')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={loadMoreReports}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 border border-blue-900 dark:border-blue-500 rounded-xs hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-60"
                >
                  {loadingMore ? 'Loading...' : 'Load more reports'}
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => !isSavingProfile && setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden z-10">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-white">
                {t('profileEdit')}
              </h3>
              <button
                type="button"
                disabled={isSavingProfile}
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 space-y-4">
              {editError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xs text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Nickname field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {t('profileNickname')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  maxLength={50}
                  required
                  placeholder="e.g. SOK Citizen"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-950 dark:text-white focus:outline-hidden focus:border-blue-900 dark:focus:border-blue-400"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Your public pseudonym across FixKH reports and comments.
                </p>
              </div>

              {/* Bio field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('profileBio')}
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {editBio.length} / 500
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                  placeholder={t('profileBioPlaceholder')}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xs text-slate-950 dark:text-white focus:outline-hidden focus:border-blue-900 dark:focus:border-blue-400 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  {t('profileCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xs transition-colors shadow-2xs disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : t('profileSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default ProfilePage
