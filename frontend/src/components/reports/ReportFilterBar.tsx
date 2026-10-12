import React from 'react'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { ReportCategory, ReportStatus, SortOption } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { CategoryIcon } from '@/components/common/CategoryIcon'

interface ReportFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: ReportCategory | 'ALL'
  onCategoryChange: (category: ReportCategory | 'ALL') => void
  selectedStatus: ReportStatus | 'ALL'
  onStatusChange: (status: ReportStatus | 'ALL') => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

const CATEGORIES: (ReportCategory | 'ALL')[] = [
  'ALL',
  'ROAD_DAMAGE',
  'STREETLIGHT',
  'GARBAGE',
  'FLOODING',
  'DRAINAGE',
  'TRAFFIC_SAFETY',
  'PUBLIC_FACILITY',
  'OTHER',
]

const STATUSES: (ReportStatus | 'ALL')[] = [
  'ALL',
  'REPORTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
]

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}) => {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
      {/* Search Input & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded-md hover:bg-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as ReportStatus | 'ALL')}
              className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer outline-hidden transition-all"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {t(`status_${st}` as any)}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer outline-hidden transition-all"
            >
              <option value="latest">{t('sortLatest')}</option>
              <option value="popular">{t('sortPopular')}</option>
              <option value="most_supported">{t('sortMostSupported')}</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat
          const key = `cat_${cat}` as any
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {cat !== 'ALL' && (
                <CategoryIcon
                  category={cat}
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                />
              )}
              <span>{t(key)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
