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
    <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-4 shadow-2xs space-y-3 transition-colors duration-150">
      {/* Search Input & Select Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-800 dark:focus:ring-blue-500 transition-colors outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-mono uppercase px-1.5 py-0.5 rounded-xs hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
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
              className="appearance-none pl-3 pr-8 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 cursor-pointer outline-hidden transition-colors"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {t(`status_${st}` as any)}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 cursor-pointer outline-hidden transition-colors"
            >
              <option value="latest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('sortLatest')}</option>
              <option value="popular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('sortPopular')}</option>
              <option value="most_supported" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('sortMostSupported')}</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Filter Chips / Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-200 dark:border-slate-800">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat
          const key = `cat_${cat}` as any
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs transition-colors border ${
                isSelected
                  ? 'bg-blue-800 dark:bg-blue-600 text-white border-blue-950 dark:border-blue-500 font-bold uppercase tracking-wider shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-slate-700 font-medium'
              }`}
            >
              {cat !== 'ALL' && (
                <CategoryIcon
                  category={cat}
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
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
