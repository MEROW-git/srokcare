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
  Sparkles,
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
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* Disclaimer Banner on top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <DisclaimerBanner />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-semibold shadow-2xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Cambodia's Crowdsourced Civic Reporting</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {t('heroTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Together.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                {t('heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/reports/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
                >
                  <MapPin className="w-5 h-5" />
                  <span>{t('ctaReport')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/map"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200/90 shadow-xs transition-all hover:border-slate-300"
                >
                  <Compass className="w-5 h-5 text-blue-600" />
                  <span>{t('ctaExploreMap')}</span>
                </Link>

                <Link
                  to="/feed"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
                >
                  <span>{t('ctaBrowseFeed')}</span>
                </Link>
              </div>

              {/* Key Highlights */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">100%</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Pseudonymous</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-blue-600">25</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Provinces Covered</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-600">Open</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Civic Platform</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl -z-10" />

                {/* Floating Map Preview Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Live Incident Map</h4>
                        <p className="text-[10px] text-slate-400">Phnom Penh & Provinces</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      Live Feed
                    </span>
                  </div>

                  {/* Simulated map graphic snippet */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-4/3 border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
                      alt="Civic Issue Example"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="inline-block px-2 py-0.5 bg-blue-600 rounded-md text-[10px] font-bold mb-1 w-max">
                        DRAINAGE
                      </span>
                      <p className="text-xs font-bold leading-tight">
                        Clogged runoff grates along St. 271
                      </p>
                      <p className="text-[10px] text-slate-300 mt-0.5">Chamkarmon, Phnom Penh</p>
                    </div>
                  </div>

                  {/* Citizen engagement quote */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>74 citizens supported this week</span>
                    </div>
                    <span className="font-bold text-blue-600">View Map →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative group hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step1Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative group hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step2Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative group hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('step3Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('categoriesTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">{t('categoriesSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const key = `cat_${cat.key}` as any
            return (
              <Link
                key={cat.key}
                to={`/feed?category=${cat.key}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all group flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CategoryIcon category={cat.key} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t(key)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('recentReportsTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              {t('recentReportsSubtitle')}
            </p>
          </div>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800"
          >
            <span>{t('viewAllReports')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>

      {/* Platform Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('platformBenefitsTitle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2">
              FixKH was architected specifically for citizen peace-of-mind and neighborhood coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-base font-bold text-white">{t('benefit1Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('benefit1Desc')}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Compass className="w-6 h-6 text-indigo-400" />
              <h3 className="text-base font-bold text-white">{t('benefit2Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('benefit2Desc')}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Layers className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-bold text-white">{t('benefit3Title')}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('benefit3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
