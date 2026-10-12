import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ShieldCheck, Heart } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-16 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Fix<span className="text-blue-600">KH</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
              {t('appTagline')} — A community-driven public issue reporting platform for Cambodia. Documenting neighborhood problems, empowering citizen voices, and tracking infrastructure improvements together.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 max-w-md">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Independent civic initiative. Not an official government body.</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/feed" className="hover:text-blue-600 transition-colors">
                  {t('navFeed')}
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-blue-600 transition-colors">
                  {t('navMap')}
                </Link>
              </li>
              <li>
                <Link to="/reports/new" className="hover:text-blue-600 transition-colors">
                  {t('ctaReport')}
                </Link>
              </li>
              <li>
                <Link to="/my-reports" className="hover:text-blue-600 transition-colors">
                  {t('navMyReports')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Issue Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Key Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>{t('cat_ROAD_DAMAGE')}</li>
              <li>{t('cat_STREETLIGHT')}</li>
              <li>{t('cat_GARBAGE')}</li>
              <li>{t('cat_FLOODING')}</li>
              <li>{t('cat_DRAINAGE')}</li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 FixKH Civic Initiative Cambodia. Built for community betterment.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for citizens across Cambodia</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
