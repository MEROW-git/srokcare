import React from 'react'
import type { ReportStatus } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { Clock, Eye, Wrench, CheckCircle2, XCircle } from 'lucide-react'

interface ReportStatusBadgeProps {
  status: ReportStatus
  className?: string
  showIcon?: boolean
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const { t } = useTranslation()

  const config: Record<
    ReportStatus,
    { labelKey: 'status_REPORTED' | 'status_UNDER_REVIEW' | 'status_IN_PROGRESS' | 'status_RESOLVED' | 'status_REJECTED'; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    REPORTED: {
      labelKey: 'status_REPORTED',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-800 dark:text-slate-200',
      border: 'border-slate-300 dark:border-slate-700',
      icon: <Clock className="w-3 h-3 text-slate-700 dark:text-slate-400" />,
    },
    UNDER_REVIEW: {
      labelKey: 'status_UNDER_REVIEW',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-900 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-700',
      icon: <Eye className="w-3 h-3 text-amber-800 dark:text-amber-400" />,
    },
    IN_PROGRESS: {
      labelKey: 'status_IN_PROGRESS',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-900 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-700',
      icon: <Wrench className="w-3 h-3 text-blue-800 dark:text-blue-400" />,
    },
    RESOLVED: {
      labelKey: 'status_RESOLVED',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-700',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-800 dark:text-emerald-400" />,
    },
    REJECTED: {
      labelKey: 'status_REJECTED',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-900 dark:text-rose-200',
      border: 'border-rose-300 dark:border-rose-700',
      icon: <XCircle className="w-3 h-3 text-rose-800 dark:text-rose-400" />,
    },
  }

  const current = config[status] || config.REPORTED

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[11px] font-bold tracking-wide uppercase border ${current.bg} ${current.text} ${current.border} ${className}`}
    >
      {showIcon && current.icon}
      <span>{t(current.labelKey)}</span>
    </span>
  )
}
