import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-16 pt-12 pb-14 text-slate-300 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xs bg-blue-700 text-white flex items-center justify-center border border-blue-600">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Fix<span className="text-blue-400">KH</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded-xs">
                Civic Initiative
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              {t('appTagline')} — វេទិការាយការណ៍បញ្ហាសង្គមរបស់ពលរដ្ឋកម្ពុជា។ An independent civic platform where residents can document and discuss neighborhood infrastructure issues.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xs border border-slate-800 max-w-md">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[11px] leading-snug">
                FixKH is an independent open civic platform, not an official government entity.
              </span>
            </div>
          </div>

          {/* Directory Navigation */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-100 mb-3 border-b border-slate-800 pb-1.5">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/feed" className="text-slate-400 hover:text-white transition-colors">
                  {t('navFeed')}
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-slate-400 hover:text-white transition-colors">
                  {t('navMap')}
                </Link>
              </li>
              <li>
                <Link to="/reports/new" className="text-slate-400 hover:text-white transition-colors">
                  {t('ctaReport')}
                </Link>
              </li>
              <li>
                <Link to="/my-reports" className="text-slate-400 hover:text-white transition-colors">
                  {t('navMyReports')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Issue Categories */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-100 mb-3 border-b border-slate-800 pb-1.5">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>{t('cat_ROAD_DAMAGE')}</li>
              <li>{t('cat_STREETLIGHT')}</li>
              <li>{t('cat_GARBAGE')}</li>
              <li>{t('cat_FLOODING')}</li>
              <li>{t('cat_DRAINAGE')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 FixKH Civic Initiative Cambodia. Documenting public infrastructure with precision.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Community Reports</span>
            <span>•</span>
            <span>Pseudonymous Participation</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
