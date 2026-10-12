import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Compass, Plus, FolderOpen, User } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-lg">
      <Link
        to="/feed"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          isActive('/feed') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <LayoutGrid className="w-5 h-5" />
        <span>{t('navFeed')}</span>
      </Link>

      <Link
        to="/map"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          isActive('/map') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span>{t('navMap')}</span>
      </Link>

      {/* Floating Plus CTA */}
      <Link
        to="/reports/new"
        className="flex items-center justify-center -mt-6 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
        title={t('ctaReport')}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </Link>

      <Link
        to="/my-reports"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          isActive('/my-reports') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <FolderOpen className="w-5 h-5" />
        <span>{t('navMyReports')}</span>
      </Link>

      <Link
        to="/settings"
        className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
          isActive('/settings') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <User className="w-5 h-5" />
        <span>{t('navSettings')}</span>
      </Link>
    </div>
  )
}
