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
    <aside className="w-80 shrink-0 space-y-4">
      {/* Community Statistics Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-4 shadow-2xs transition-colors duration-150">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="p-1 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{t('statsTitle')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-base font-black font-mono text-slate-900 dark:text-slate-100">{stats.total}</div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-tight mt-0.5">
              Reports
            </div>
          </div>
          <div className="p-2 rounded-xs bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70">
            <div className="text-base font-black font-mono text-emerald-800 dark:text-emerald-300">{stats.resolved}</div>
            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase leading-tight mt-0.5">
              Fixed
            </div>
          </div>
          <div className="p-2 rounded-xs bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70">
            <div className="text-base font-black font-mono text-blue-900 dark:text-blue-300">{stats.activeContributors}</div>
            <div className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase leading-tight mt-0.5">
              Citizens
            </div>
          </div>
        </div>
      </div>

      {/* Trending Community Reports */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-4 shadow-2xs transition-colors duration-150">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="p-1 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-blue-900 dark:text-blue-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">{t('trendingTitle')}</h3>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {trendingReports.slice(0, 4).map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="block py-2.5 group hover:bg-slate-50/80 dark:hover:bg-slate-800/60 px-1 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <ReportCategoryBadge category={report.category} size="sm" />
                <span className="text-[11px] font-medium font-mono text-slate-500 dark:text-slate-400">
                  {report.province}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 line-clamp-2 transition-colors leading-snug">
                {report.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-blue-800 dark:text-blue-400" />
                  {report.supportCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {report.commentCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Privacy & Safety Guidance Card */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-md border border-slate-300 dark:border-slate-800 p-4 shadow-2xs transition-colors duration-150">
        <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100">
          <ShieldCheck className="w-4 h-4 text-blue-900 dark:text-blue-400" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider">{t('safetyGuidanceTitle')}</h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('safetyGuidanceText')}
        </p>
      </div>
    </aside>
  )
}
