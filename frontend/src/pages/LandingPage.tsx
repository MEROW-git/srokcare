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
  FileText,
} from 'lucide-react'
import type { Report, ReportCategory } from '@/types/report'
import { reportService } from '@/services/reportService'
import { useTranslation } from '@/contexts/LanguageContext'
import { ReportCard } from '@/components/reports/ReportCard'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'
import { ReportCategoryBadge } from '@/components/reports/ReportCategoryBadge'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'

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
  const [loadError, setLoadError] = useState(false)
  const featuredReport = recentReports[0]

  useEffect(() => {
    reportService
      .getReports({ sortBy: 'latest' })
      .then((reports) => {
        setRecentReports(reports.slice(0, 3))
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 transition-colors duration-150">
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
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-[11px] font-semibold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                <span className="w-1.5 h-1.5 rounded-xs bg-blue-700 dark:bg-blue-500"></span>
                {t('landingEyebrow')}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.14]">
                {t('heroTitle')} <span className="text-blue-700 dark:text-blue-400">Together.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl font-normal">
                {t('heroSubtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                <Link
                  to="/reports/new"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 active:bg-blue-950 text-white font-bold text-sm shadow-xs transition-colors border border-blue-950 dark:border-blue-500"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{t('ctaReport')}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  to="/map"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors"
                >
                  <Compass className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>{t('ctaExploreMap')}</span>
                </Link>

                <Link
                  to="/feed"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span>{t('ctaBrowseFeed')}</span>
                </Link>
              </div>

              {/* Available features, without invented usage or coverage figures */}
              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3">
                <div className="border-l-2 border-slate-900 dark:border-slate-400 pl-3">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('highlightNicknameTitle')}</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{t('highlightNicknameDesc')}</div>
                </div>
                <div className="border-l-2 border-blue-700 dark:border-blue-500 pl-3">
                  <div className="text-sm font-bold text-blue-700 dark:text-blue-400">{t('highlightMapTitle')}</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{t('highlightMapDesc')}</div>
                </div>
                <div className="border-l-2 border-emerald-600 dark:border-emerald-500 pl-3">
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{t('highlightStatusTitle')}</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{t('highlightStatusDesc')}</div>
                </div>
              </div>
            </div>

            {/* The featured report always comes from the report API. */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xs bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center border border-slate-800 dark:border-slate-700">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{t('featuredReportTitle')}</h4>
                      {featuredReport && <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('featuredReportSubtitle')}</p>}
                    </div>
                  </div>
                  {featuredReport && <ReportStatusBadge status={featuredReport.status} />}
                </div>

                {loading ? (
                  <div className="aspect-16/10 rounded-xs bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : featuredReport ? (
                  <>
                    <Link to={`/reports/${featuredReport.id}`} className="block relative rounded-xs overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-16/10 border border-slate-200 dark:border-slate-800">
                      {featuredReport.images?.[0] ? (
                        <img src={featuredReport.images[0]} alt={featuredReport.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500"><CategoryIcon category={featuredReport.category} className="w-12 h-12" /></div>
                      )}
                    </Link>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2"><ReportCategoryBadge category={featuredReport.category} size="sm" /></div>
                      <Link to={`/reports/${featuredReport.id}`} className="block text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-700 dark:hover:text-blue-400">{featuredReport.title}</Link>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{[featuredReport.address, featuredReport.district, featuredReport.province].filter(Boolean).join(', ')}</p>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xs border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />{featuredReport.supportCount} {t('featuredSupports')}</span>
                      <Link to={`/reports/${featuredReport.id}`} className="font-bold text-blue-700 dark:text-blue-400 hover:underline">{t('reportDetailsTitle')} →</Link>
                    </div>
                  </>
                ) : (
                  <div className="aspect-16/10 flex flex-col items-center justify-center gap-3 rounded-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center px-5">
                    <FileText className="w-9 h-9 text-slate-400" />
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{loadError ? t('reportsUnavailable') : t('noCommunityReports')}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{loadError ? t('reportsUnavailableDesc') : t('noCommunityReportsDesc')}</p>
                    {!loadError && <Link to="/reports/new" className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline">{t('ctaReport')} →</Link>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-1">
                CIVIC PROCESS PROTOCOL
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('howItWorksTitle')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
              {t('howItWorksSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-5 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">STEP 01</span>
              <div className="w-8 h-8 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t('step1Desc')}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-5 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">STEP 02</span>
              <div className="w-8 h-8 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t('step2Desc')}</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-5 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">STEP 03</span>
              <div className="w-8 h-8 rounded-xs bg-slate-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-1">
                CIVIC INCIDENT TAXONOMY
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('categoriesTitle')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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
                className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-800 dark:hover:border-slate-600 transition-colors group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-2.5 group-hover:bg-slate-900 dark:group-hover:bg-slate-700 group-hover:text-white transition-colors">
                  <CategoryIcon category={cat.key} className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {t(key)}
                  </h3>
                  <p
                    lang={language === 'km' ? 'km' : undefined}
                    className={`text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 ${
                      language === 'km'
                        ? 'font-khmer tracking-normal leading-[1.6] py-0.5'
                        : 'leading-tight'
                    }`}
                  >
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
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-1">
                COMMUNITY REPORTS
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('recentReportsTitle')}
              </h2>
            </div>
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
            >
              <span>{t('viewAllReports')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800 animate-pulse" />
            <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800 animate-pulse" />
          </div>
        ) : recentReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
            <p className="font-bold text-slate-900 dark:text-slate-100">{loadError ? t('reportsUnavailable') : t('noCommunityReports')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{loadError ? t('reportsUnavailableDesc') : t('noCommunityReportsDesc')}</p>
            {!loadError && <Link to="/reports/new" className="inline-block mt-3 text-sm font-bold text-blue-700 dark:text-blue-400 hover:underline">{t('ctaReport')} →</Link>}
          </div>
        )}
      </section>

      {/* Civic Architecture & Trust Framework */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 dark:bg-slate-900/90 border border-slate-800 text-white rounded-md p-6 sm:p-9 shadow-xs">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              CIVIC INTEGRITY CHARTER
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t('platformBenefitsTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              FixKH helps residents share location based reports and follow the status shown on each report. It is an independent community platform.
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
