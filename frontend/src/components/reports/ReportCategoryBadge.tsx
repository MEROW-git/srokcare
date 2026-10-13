import React from 'react'
import type { ReportCategory } from '@/types/report'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { useTranslation } from '@/contexts/LanguageContext'

interface ReportCategoryBadgeProps {
  category: ReportCategory
  className?: string
  size?: 'sm' | 'md'
}

export const ReportCategoryBadge: React.FC<ReportCategoryBadgeProps> = ({
  category,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation()

  const categoryLabelKey = `cat_${category}` as 'cat_ROAD_DAMAGE' | 'cat_STREETLIGHT' | 'cat_GARBAGE' | 'cat_FLOODING' | 'cat_DRAINAGE' | 'cat_TRAFFIC_SAFETY' | 'cat_PUBLIC_FACILITY' | 'cat_OTHER'

  const colorStyles: Record<ReportCategory, { bg: string; text: string; border: string; iconColor: string }> = {
    ROAD_DAMAGE: {
      bg: 'bg-orange-50 dark:bg-orange-950/50',
      text: 'text-orange-900 dark:text-orange-200',
      border: 'border-orange-300 dark:border-orange-800',
      iconColor: 'text-orange-700 dark:text-orange-300',
    },
    STREETLIGHT: {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-900 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-800',
      iconColor: 'text-amber-700 dark:text-amber-300',
    },
    GARBAGE: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-900 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-800',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
    },
    FLOODING: {
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      text: 'text-blue-900 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-800',
      iconColor: 'text-blue-700 dark:text-blue-300',
    },
    DRAINAGE: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
      text: 'text-cyan-900 dark:text-cyan-200',
      border: 'border-cyan-300 dark:border-cyan-800',
      iconColor: 'text-cyan-700 dark:text-cyan-300',
    },
    TRAFFIC_SAFETY: {
      bg: 'bg-red-50 dark:bg-red-950/50',
      text: 'text-red-900 dark:text-red-200',
      border: 'border-red-300 dark:border-red-800',
      iconColor: 'text-red-700 dark:text-red-300',
    },
    PUBLIC_FACILITY: {
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      text: 'text-purple-900 dark:text-purple-200',
      border: 'border-purple-300 dark:border-purple-800',
      iconColor: 'text-purple-700 dark:text-purple-300',
    },
    OTHER: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-800 dark:text-slate-200',
      border: 'border-slate-300 dark:border-slate-700',
      iconColor: 'text-slate-700 dark:text-slate-400',
    },
  }

  const style = colorStyles[category] || colorStyles.OTHER
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xs border ${style.bg} ${style.text} ${style.border} ${paddingClass} ${className}`}
    >
      <span className={style.iconColor}>
        <CategoryIcon category={category} className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </span>
      <span>{t(categoryLabelKey)}</span>
    </span>
  )
}
