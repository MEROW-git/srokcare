import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShieldCheck, BarChart3, ThumbsUp, MessageSquare } from 'lucide-react'
import type { Report } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'

interface RightSidebarProps {
  trendingReports: Report[]
  stats?: {
    total: number
    resolved: number
    activeContributors: number
  }
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  trendingReports,
  stats = { total: 48, resolved: 29, activeContributors: 142 },
}) => {
  const { t } = useTranslation()

  return (
    <aside className="w-80 shrink-0 space-y-6">
      {/* Community Statistics Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('statsTitle')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-lg font-black text-slate-900">{stats.total}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase leading-tight mt-0.5">
              Reports
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="text-lg font-black text-emerald-700">{stats.resolved}</div>
            <div className="text-[10px] font-semibold text-emerald-600 uppercase leading-tight mt-0.5">
              Fixed
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="text-lg font-black text-blue-700">{stats.activeContributors}</div>
            <div className="text-[10px] font-semibold text-blue-600 uppercase leading-tight mt-0.5">
              Citizens
            </div>
          </div>
        </div>
      </div>

      {/* Trending Community Reports */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('trendingTitle')}</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {trendingReports.slice(0, 4).map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="block py-3 group hover:bg-slate-50/50 rounded-lg px-1 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <ReportCategoryBadge category={report.category} size="sm" />
                <span className="text-[11px] font-medium text-slate-400">
                  {report.province}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-2 transition-colors">
                {report.title}
              </h4>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-blue-500" />
                  {report.supportCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  {report.commentCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Privacy & Safety Guidance Card */}
      <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 rounded-2xl border border-blue-100/90 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider">{t('safetyGuidanceTitle')}</h4>
        </div>
        <p className="text-xs text-blue-800/90 leading-relaxed">
          {t('safetyGuidanceText')}
        </p>
      </div>
    </aside>
  )
}
