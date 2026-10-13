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
    ROAD_DAMAGE: { bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300', iconColor: 'text-orange-700' },
    STREETLIGHT: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300', iconColor: 'text-amber-700' },
    GARBAGE: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300', iconColor: 'text-emerald-700' },
    FLOODING: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-300', iconColor: 'text-blue-700' },
    DRAINAGE: { bg: 'bg-cyan-50', text: 'text-cyan-900', border: 'border-cyan-300', iconColor: 'text-cyan-700' },
    TRAFFIC_SAFETY: { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-300', iconColor: 'text-red-700' },
    PUBLIC_FACILITY: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-300', iconColor: 'text-purple-700' },
    OTHER: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', iconColor: 'text-slate-700' },
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

