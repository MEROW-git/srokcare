import React, { useEffect, useState } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import type { Report, ReportCategory, ReportStatus } from '@/types/report'
import { reportService } from '@/services/reportService'
import { CAMBODIA_PROVINCES } from '@/data/provinces'
import { useTranslation } from '@/contexts/LanguageContext'
import { CambodiaMap } from '@/components/map/CambodiaMap'
import { CategoryIcon } from '@/components/common/CategoryIcon'

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

export const MapPage: React.FC = () => {
  const { t, language } = useTranslation()
  const [reports, setReports] = useState<Report[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'ALL'>('ALL')
  const [selectedProvince, setSelectedProvince] = useState<string | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    reportService
      .getReports({
        category: selectedCategory,
        status: selectedStatus,
        province: selectedProvince === 'ALL' ? undefined : selectedProvince,
        search: searchQuery,
      })
      .then((data) => setReports(data))
      .finally(() => setLoading(false))
  }, [selectedCategory, selectedStatus, selectedProvince, searchQuery])

  // Center based on province selection
  const currentProvinceData = CAMBODIA_PROVINCES.find((p) => p.en === selectedProvince)
  const mapCenter: [number, number] = currentProvinceData
    ? [currentProvinceData.defaultLng, currentProvinceData.defaultLat]
    : [104.9282, 11.5564] // default Phnom Penh

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-3 transition-colors duration-150">
      {/* Top Header & Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Title & Count */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 border border-slate-800 dark:border-slate-700">
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('navMap')}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                {loading && <Loader2 className="w-3 h-3 text-slate-700 dark:text-slate-300 animate-spin" />}
                <span>{reports.length} GEOLOCATED PINS ACROSS CAMBODIA</span>
              </p>
            </div>
          </div>

          {/* Search & Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pins..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden transition-colors"
              />
            </div>

            {/* Province Select */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-sm border border-slate-300 dark:border-slate-700 outline-hidden focus:border-slate-800 dark:focus:border-blue-500"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Cambodia (25 Provinces)</option>
              {CAMBODIA_PROVINCES.map((p) => (
                <option key={p.en} value={p.en} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {language === 'km' ? p.km : p.en}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-sm border border-slate-300 dark:border-slate-700 outline-hidden focus:border-slate-800 dark:focus:border-blue-500 font-mono"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {st === 'ALL' ? 'ALL STATUSES' : t(`status_${st}` as any)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            const key = `cat_${cat}` as any
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-blue-600 border-slate-900 dark:border-blue-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
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

      {/* Interactive Map Canvas */}
      <div className="w-full h-[calc(100vh-270px)] min-h-[550px] rounded-md border border-slate-300 dark:border-slate-800 overflow-hidden shadow-xs">
        <CambodiaMap
          reports={reports}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          center={mapCenter}
          zoom={selectedProvince === 'ALL' ? 8 : 12}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
