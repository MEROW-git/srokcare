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

  const colorStyles: Record<ReportCategory, { bg: string; text: string; iconColor: string }> = {
    ROAD_DAMAGE: { bg: 'bg-orange-50', text: 'text-orange-800', iconColor: 'text-orange-600' },
    STREETLIGHT: { bg: 'bg-yellow-50', text: 'text-yellow-800', iconColor: 'text-yellow-600' },
    GARBAGE: { bg: 'bg-emerald-50', text: 'text-emerald-800', iconColor: 'text-emerald-600' },
    FLOODING: { bg: 'bg-blue-50', text: 'text-blue-800', iconColor: 'text-blue-600' },
    DRAINAGE: { bg: 'bg-cyan-50', text: 'text-cyan-800', iconColor: 'text-cyan-600' },
    TRAFFIC_SAFETY: { bg: 'bg-red-50', text: 'text-red-800', iconColor: 'text-red-600' },
    PUBLIC_FACILITY: { bg: 'bg-purple-50', text: 'text-purple-800', iconColor: 'text-purple-600' },
    OTHER: { bg: 'bg-slate-100', text: 'text-slate-800', iconColor: 'text-slate-600' },
  }

  const style = colorStyles[category] || colorStyles.OTHER
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border border-black/5 ${style.bg} ${style.text} ${paddingClass} ${className}`}
    >
      <span className={style.iconColor}>
        <CategoryIcon category={category} className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </span>
      <span>{t(categoryLabelKey)}</span>
    </span>
  )
}
