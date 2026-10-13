import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Report, ReportStatus } from '@/types/report'
import { reportService } from '@/services/reportService'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'

export const MyReportsPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [myReports, setMyReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL')

  // Delete modal state
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)

  // Edit modal state
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const loadMyReports = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await reportService.getMyReports(user.id, user.nickname)
      setMyReports(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyReports()
  }, [user])

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return
    try {
      await reportService.deleteReport(reportToDelete.id)
      setMyReports((prev) => prev.filter((r) => r.id !== reportToDelete.id))
      toast.success('Report deleted successfully')
    } catch {
      toast.error('Failed to delete report')
    } finally {
      setReportToDelete(null)
    }
  }

  const handleOpenEdit = (report: Report) => {
    setReportToEdit(report)
    setEditTitle(report.title)
    setEditDescription(report.description)
    setEditAddress(report.address || '')
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportToEdit) return

    setIsUpdating(true)
    try {
      const updated = await reportService.updateReport(reportToEdit.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        address: editAddress.trim(),
      })
      setMyReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      toast.success('Report updated successfully')
      setReportToEdit(null)
    } catch {
      toast.error('Failed to update report')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredReports = myReports.filter((r) => {
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.province.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-semibold tracking-wider uppercase mb-1">
            <FolderOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>Citizen Workspace • បញ្ជីរាយការណ៍ផ្ទាល់ខ្លួន</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('myReportsTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('myReportsSubtitle')}</p>
        </div>

        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors uppercase tracking-wider"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('ctaReport')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-md border border-slate-300 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my reports..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-sm border border-slate-300 focus:border-slate-800 outline-hidden transition-colors"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
          className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800 font-mono"
        >
          <option value="ALL">ALL STATUSES</option>
          <option value="REPORTED">REPORTED</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* Reports Table or Grid */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-24 bg-slate-100 rounded-md border border-slate-200 animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-md border border-slate-200 animate-pulse" />
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title="No reports found in your account"
          description="You haven't submitted any civic issue reports matching your criteria yet."
          actionLabel="Submit Your First Report"
          onAction={() => (window.location.href = '/reports/new')}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-4 rounded-md border border-slate-300 shadow-2xs hover:border-slate-400 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <ReportCategoryBadge category={report.category} size="sm" />
                  <ReportStatusBadge status={report.status} />
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  to={`/reports/${report.id}`}
                  className="block text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors truncate"
                >
                  {report.title}
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {report.district}, {report.province}
                    {report.address ? ` • ${report.address}` : ''}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{report.supportCount} SUPPORTS</span>
                  <span className="text-slate-300">•</span>
                  <span>{report.commentCount} COMMENTS</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <Link
                  to={`/reports/${report.id}`}
                  className="p-1.5 rounded-xs text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="View Details"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleOpenEdit(report)}
                  className="p-1.5 rounded-xs text-slate-700 hover:text-slate-950 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                  title={t('editReport')}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setReportToDelete(report)}
                  className="p-1.5 rounded-xs text-rose-600 hover:text-rose-800 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
                  title={t('deleteReport')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!reportToDelete}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDesc')}
        confirmText={t('confirmDelete')}
        cancelText={t('cancel')}
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReportToDelete(null)}
      />

      {/* Edit Report Modal */}
      {reportToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4">{t('editReport')}</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Landmark / Street
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReportToEdit(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-sm"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-sm shadow-xs uppercase tracking-wider"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  )
}
