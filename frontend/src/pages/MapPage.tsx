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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Header & Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Title & Count */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                {t('navMap')}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                {loading && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
                <span>Showing {reports.length} community issue pins across Cambodia</span>
              </p>
            </div>
          </div>

          {/* Search & Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pins..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              />
            </div>

            {/* Province Select */}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Cambodia</option>
              {CAMBODIA_PROVINCES.map((p) => (
                <option key={p.en} value={p.en}>
                  {language === 'km' ? p.km : p.en}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'ALL')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {t(`status_${st}` as any)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-100">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            const key = `cat_${cat}` as any
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

      {/* Interactive Map Canvas */}
      <div className="w-full h-[calc(100vh-280px)] min-h-[550px]">
        <CambodiaMap
          reports={reports}
          selectedReport={selectedReport}
          onSelectReport={setSelectedReport}
          center={mapCenter}
          zoom={selectedProvince === 'ALL' ? 8 : 12}
          className="w-full h-full shadow-md"
        />
      </div>
    </div>
  )
}
