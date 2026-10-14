import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Clock,
  Eye,
  Wrench,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Report, ReportCategory, ReportStatus } from '@/types/report'
import type { AdminStats } from '@/types/admin'
import { adminService } from '@/services/adminService'
import { useTranslation } from '@/contexts/LanguageContext'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents'
import { isMockMode } from '@/services/apiClient'
import { hasKhmerText } from '@/lib/utils'

const ALL_STATUSES: ReportStatus[] = [
  'REPORTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
]

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL')
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'ALL'>('ALL')
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [reps, st] = await Promise.all([
        adminService.getAdminReports({
          status: filterStatus === 'ALL' ? undefined : filterStatus,
          category: filterCategory === 'ALL' ? undefined : filterCategory,
          search: searchQuery,
        }),
        adminService.getAdminStats(),
      ])
      const seen = new Set<string>()
      const unique = reps.filter((r) => !seen.has(r.id) && seen.add(r.id))
      setReports(unique)
      setStats(st)
    } finally {
      setLoading(false)
    }
  }

  const reloadAdminSilently = async () => {
    try {
      const [reps, st] = await Promise.all([
        adminService.getAdminReports({
          status: filterStatus === 'ALL' ? undefined : filterStatus,
          category: filterCategory === 'ALL' ? undefined : filterCategory,
          search: searchQuery,
        }),
        adminService.getAdminStats(),
      ])
      const seen = new Set<string>()
      const unique = reps.filter((r) => !seen.has(r.id) && seen.add(r.id))
      setReports(unique)
      setStats(st)
    } catch (err) {
      console.warn('Realtime admin refresh notice:', err)
    }
  }

  useRealtimeEvents({
    topic: '/topic/reports',
    onRefresh: reloadAdminSilently,
  })

  useEffect(() => {
    loadAdminData()
  }, [filterStatus, filterCategory, searchQuery])

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    setActiveUpdatingId(reportId)
    try {
      const updated = await adminService.updateStatus(reportId, newStatus)
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)))
      // refresh stats
      const newStats = await adminService.getAdminStats()
      setStats(newStats)
      toast.success(`Status updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setActiveUpdatingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 transition-colors duration-150">
      {/* Demo Moderation Banner */}
      {isMockMode() && <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xs p-3 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span className="font-medium">{t('adminDemoBanner')}</span>
        </div>
        <span className="px-2 py-0.5 rounded-xs bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-mono text-[10px] font-bold shrink-0">
          DEMO ACTIVE
        </span>
      </div>}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold tracking-wider uppercase mb-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
          <span>Community Report Moderation • ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('adminTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('adminSubtitle')}</p>
      </div>

      {/* Overview Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs font-mono">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reports
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats.totalReports}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs font-mono">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Reported
            </div>
            <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">{stats.reported}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs font-mono">
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              Reviewing
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">{stats.underReview}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs font-mono">
            <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3 h-3 text-blue-700 dark:text-blue-400" />
              In Progress
            </div>
            <div className="text-xl font-black text-blue-800 dark:text-blue-300 mt-1">{stats.inProgress}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs font-mono">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Resolved
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{stats.resolved}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs font-mono">
            <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              Rejected
            </div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{stats.rejected}</div>
          </div>
        </div>
      )}

      {/* Moderation Controls & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search moderation queue..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'ALL')}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-sm border border-slate-300 dark:border-slate-700 outline-hidden focus:border-slate-800 dark:focus:border-blue-500 font-mono"
          >
            <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ALL STATUSES</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {st}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ReportCategory | 'ALL')}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-sm border border-slate-300 dark:border-slate-700 outline-hidden focus:border-slate-800 dark:focus:border-blue-500 font-mono"
          >
            <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">ALL CATEGORIES</option>
            <option value="ROAD_DAMAGE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Road Damage</option>
            <option value="STREETLIGHT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Streetlights</option>
            <option value="GARBAGE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Garbage</option>
            <option value="FLOODING" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Flooding</option>
            <option value="DRAINAGE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Drainage</option>
            <option value="TRAFFIC_SAFETY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Traffic Safety</option>
            <option value="PUBLIC_FACILITY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Public Facility</option>
            <option value="OTHER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other</option>
          </select>
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
              <tr>
                <th className="py-2.5 px-4 sm:px-5">Incident Record</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3">Moderation Action</th>
                <th className="py-2.5 px-4 sm:px-5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500 font-mono">
                    Loading moderation queue...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 dark:text-slate-400 font-mono">
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    {/* Title & author */}
                    <td className="py-3 px-4 sm:px-5">
                      <div className="space-y-0.5">
                        {(() => {
                          const isKhmer = hasKhmerText(report.title)
                          return (
                            <Link
                              to={`/reports/${report.id}`}
                              lang={isKhmer ? 'km' : undefined}
                              className={`font-bold text-slate-900 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400 line-clamp-1 block transition-colors ${
                                isKhmer ? 'font-khmer tracking-normal leading-normal py-0.5' : ''
                              }`}
                            >
                              {report.title}
                            </Link>
                          )
                        })()}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          <span>By {report.authorNickname}</span>
                          <span>•</span>
                          <span>{report.supportCount} SUPPORTS</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <ReportCategoryBadge category={report.category} size="sm" />
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <div>{report.province}</div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{report.district}</div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-3">
                      <ReportStatusBadge status={report.status} />
                    </td>

                    {/* Action Selector */}
                    <td className="py-3 px-3">
                      <select
                        value={report.status}
                        disabled={activeUpdatingId === report.id}
                        onChange={(e) =>
                          handleStatusChange(report.id, e.target.value as ReportStatus)
                        }
                        className="px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xs border border-slate-300 dark:border-slate-700 outline-hidden focus:border-slate-800 dark:focus:border-blue-500 cursor-pointer disabled:opacity-50 font-mono"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Link */}
                    <td className="py-3 px-4 sm:px-5 text-right">
                      <Link
                        to={`/reports/${report.id}`}
                        className="p-1 rounded-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-flex transition-colors"
                        title="Inspect report"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
