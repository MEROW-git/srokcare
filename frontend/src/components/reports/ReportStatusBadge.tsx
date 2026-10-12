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
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    UNDER_REVIEW: {
      labelKey: 'status_UNDER_REVIEW',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    IN_PROGRESS: {
      labelKey: 'status_IN_PROGRESS',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
    RESOLVED: {
      labelKey: 'status_RESOLVED',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      labelKey: 'status_REJECTED',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  }

  const current = config[status] || config.REPORTED

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border} shadow-2xs ${className}`}
    >
      {showIcon && current.icon}
      <span>{t(current.labelKey)}</span>
    </span>
  )
}
