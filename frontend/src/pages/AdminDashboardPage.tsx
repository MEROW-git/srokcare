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
      setReports(reps)
      setStats(st)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Moderation Banner */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-start sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-amber-200 text-amber-800">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium">{t('adminDemoBanner')}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[11px] font-bold shrink-0">
          DEMO MODE
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Platform Moderation Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('adminTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('adminSubtitle')}</p>
      </div>

      {/* Overview Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Reports
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalReports}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Reported
            </div>
            <div className="text-2xl font-black text-slate-700 mt-1">{stats.reported}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-500" />
              Reviewing
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.underReview}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3 h-3 text-blue-500" />
              In Progress
            </div>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.inProgress}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Resolved
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.resolved}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-500" />
              Rejected
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">{stats.rejected}</div>
          </div>
        </div>
      )}

      {/* Moderation Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search moderation queue..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReportStatus | 'ALL')}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ReportCategory | 'ALL')}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_DAMAGE">Road Damage</option>
            <option value="STREETLIGHT">Streetlights</option>
            <option value="GARBAGE">Garbage</option>
            <option value="FLOODING">Flooding</option>
            <option value="DRAINAGE">Drainage</option>
            <option value="TRAFFIC_SAFETY">Traffic Safety</option>
            <option value="PUBLIC_FACILITY">Public Facility</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Report Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Admin Status Action</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading moderation queue...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title & author */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="space-y-0.5">
                        <Link
                          to={`/reports/${report.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1 block transition-colors"
                        >
                          {report.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>By {report.authorNickname}</span>
                          <span>•</span>
                          <span>{report.supportCount} supports</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <ReportCategoryBadge category={report.category} size="sm" />
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      <div>{report.province}</div>
                      <div className="text-[11px] text-slate-400">{report.district}</div>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <ReportStatusBadge status={report.status} />
                    </td>

                    {/* Action Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={report.status}
                        disabled={activeUpdatingId === report.id}
                        onChange={(e) =>
                          handleStatusChange(report.id, e.target.value as ReportStatus)
                        }
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 outline-hidden focus:border-blue-500 cursor-pointer disabled:opacity-50"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Link */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Link
                        to={`/reports/${report.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 inline-flex transition-colors"
                        title="Inspect report"
                      >
                        <ExternalLink className="w-4 h-4" />
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
