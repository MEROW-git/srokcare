import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  ArrowRight,
  Shield,
  Compass,
  CheckCircle2,
  Users,
  Camera,
  Layers,
  Building2,
  Radio,
} from 'lucide-react'
import type { Report, ReportCategory } from '@/types/report'
import { reportService } from '@/services/reportService'
import { useTranslation } from '@/contexts/LanguageContext'
import { ReportCard } from '@/components/reports/ReportCard'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'

const CATEGORIES: { key: ReportCategory; descEn: string; descKm: string }[] = [
  { key: 'ROAD_DAMAGE', descEn: 'Potholes, broken asphalt & cave-ins', descKm: 'ជង្ហុក ផ្លូវបាក់ស្រុត និងការខូចខាត' },
  { key: 'STREETLIGHT', descEn: 'Dark streets & broken solar lamps', descKm: 'ភ្លើងបំភ្លឺផ្លូវមិនដំណើរការ ឬដាច់' },
  { key: 'GARBAGE', descEn: 'Illegal trash piles & uncollected waste', descKm: 'គំនរសំរាម និងកាកសំណល់អនាធិបតេយ្យ' },
  { key: 'FLOODING', descEn: 'Standing water & monsoon street inundation', descKm: 'ទឹកលិចផ្លូវពេលភ្លៀងធ្លាក់' },
  { key: 'DRAINAGE', descEn: 'Clogged storm canals & broken grates', descKm: 'លូស្ទះ និងគម្របលូបាក់បែក' },
  { key: 'TRAFFIC_SAFETY', descEn: 'Blind corners & faded crosswalks', descKm: 'ផ្លូវកោងគ្រោះថ្នាក់ និងផ្លូវថ្មើរជើង' },
  { key: 'PUBLIC_FACILITY', descEn: 'Damaged benches, parks & sidewalks', descKm: 'សួនច្បារ បង់អង្គុយ និងចិញ្ចើមផ្លូវ' },
  { key: 'OTHER', descEn: 'Loose cables & infrastructure issues', descKm: 'ខ្សែភ្លើងធ្លាក់ និងបញ្ហាផ្សេងៗ' },
]

export const LandingPage: React.FC = () => {
  const { t, language } = useTranslation()
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportService
      .getReports({ sortBy: 'latest' })
      .then((reports) => {
        setRecentReports(reports.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Disclaimer Banner on top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <DisclaimerBanner />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-2 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-xs text-[11px] font-semibold tracking-wider text-slate-800 uppercase">
                <span className="w-1.5 h-1.5 rounded-xs bg-blue-700"></span>
                National Civic Ledger • កំណត់ត្រាសហគមន៍កម្ពុជា
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.14]">
                {t('heroTitle')} <span className="text-blue-700">Together.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {t('heroSubtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <Link
                  to="/reports/new"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm shadow-xs transition-colors"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{t('ctaReport')}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  to="/map"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-300 shadow-2xs transition-colors"
                >
                  <Compass className="w-4 h-4 text-blue-700" />
                  <span>{t('ctaExploreMap')}</span>
                </Link>

                <Link
                  to="/feed"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-slate-700 hover:text-slate-900 font-semibold text-sm hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <span>{t('ctaBrowseFeed')}</span>
                </Link>
              </div>

              {/* Key Highlights Ledger */}
              <div className="pt-5 border-t border-slate-200 grid grid-cols-3 gap-3">
                <div className="border-l-2 border-slate-900 pl-3">
                  <div className="text-xl font-black text-slate-900 font-mono">100%</div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">Pseudonymous</div>
                </div>
                <div className="border-l-2 border-blue-700 pl-3">
                  <div className="text-xl font-black text-blue-700 font-mono">25</div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">Provinces Covered</div>
                </div>
                <div className="border-l-2 border-emerald-600 pl-3">
                  <div className="text-xl font-black text-emerald-700 font-mono">Public</div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">Audit Ledger</div>
                </div>
              </div>
            </div>

            {/* Right Visual Architectural Panel */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-md border border-slate-300 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xs bg-slate-900 text-white flex items-center justify-center">
                      <Radio className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Municipal Dispatch</h4>
                      <p className="text-[10px] text-slate-500 font-mono">11.5564° N, 104.9282° E • PP-04-2026</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase bg-emerald-50 text-emerald-800 rounded-xs border border-emerald-300">
                    Active
                  </span>
                </div>

                {/* Simulated map graphic snippet */}
                <div className="relative rounded-xs overflow-hidden bg-slate-100 aspect-16/10 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
                    alt="Civic Issue Example"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-3.5 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-block px-1.5 py-0.5 bg-blue-700 rounded-xs text-[9px] font-bold tracking-wider uppercase font-mono">
                        DRAINAGE
                      </span>
                      <span className="inline-block px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded-xs text-[9px] font-bold tracking-wider uppercase font-mono">
                        UNDER REVIEW
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-tight line-clamp-1">
                      Clogged runoff grates along St. 271
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Chamkarmon, Phnom Penh • Verified by Public Works</p>
                  </div>
                </div>

                {/* Citizen coordination strip */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xs border border-slate-200 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    <span className="text-[11px] font-medium">74 citizens confirmed this incident</span>
                  </div>
                  <Link to="/map" className="font-bold text-[11px] text-blue-700 hover:text-blue-900">
                    Inspect Map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">
                CIVIC PROCESS PROTOCOL
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('howItWorksTitle')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md">
              {t('howItWorksSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white rounded-md border border-slate-300 p-5 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black text-slate-400">STEP 01</span>
              <div className="w-8 h-8 rounded-xs bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-md border border-slate-300 p-5 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black text-slate-400">STEP 02</span>
              <div className="w-8 h-8 rounded-xs bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-md border border-slate-300 p-5 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black text-slate-400">STEP 03</span>
              <div className="w-8 h-8 rounded-xs bg-slate-100 text-emerald-800 border border-slate-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">
                CIVIC INCIDENT TAXONOMY
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('categoriesTitle')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('categoriesSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const key = `cat_${cat.key}` as any
            return (
              <Link
                key={cat.key}
                to={`/feed?category=${cat.key}`}
                className="bg-white rounded-md border border-slate-300 p-3.5 shadow-2xs hover:border-slate-800 transition-colors group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xs bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center mb-2.5 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <CategoryIcon category={cat.key} className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {t(key)}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {language === 'km' ? cat.descKm : cat.descEn}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent Community Reports Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 pt-10 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">
                PUBLIC INCIDENT LEDGER
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('recentReportsTitle')}
              </h2>
            </div>
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
            >
              <span>{t('viewAllReports')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-slate-100 rounded-md border border-slate-200 animate-pulse" />
            <div className="h-64 bg-slate-100 rounded-md border border-slate-200 animate-pulse" />
            <div className="h-64 bg-slate-100 rounded-md border border-slate-200 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>

      {/* Civic Architecture & Trust Framework */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 text-white rounded-md p-6 sm:p-9 shadow-xs">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              CIVIC INTEGRITY CHARTER
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('platformBenefitsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              FixKH was architected specifically for citizen protection, objective status verification, and municipal accountability across Cambodia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xs bg-slate-950/60 border border-slate-800 space-y-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t('benefit1Title')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('benefit1Desc')}
              </p>
            </div>
            <div className="p-4 rounded-xs bg-slate-950/60 border border-slate-800 space-y-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t('benefit2Title')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('benefit2Desc')}
              </p>
            </div>
            <div className="p-4 rounded-xs bg-slate-950/60 border border-slate-800 space-y-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{t('benefit3Title')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('benefit3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
