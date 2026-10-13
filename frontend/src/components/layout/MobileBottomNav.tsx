import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Compass, Plus, FolderOpen, User } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-300 px-3 py-1.5 flex items-center justify-around shadow-md">
      <Link
        to="/feed"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/feed') ? 'text-blue-950 font-black' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <LayoutGrid className="w-4.5 h-4.5" />
        <span>{t('navFeed')}</span>
      </Link>

      <Link
        to="/map"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/map') ? 'text-blue-950 font-black' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Compass className="w-4.5 h-4.5" />
        <span>{t('navMap')}</span>
      </Link>

      {/* Structured Plus CTA */}
      <Link
        to="/reports/new"
        className="flex items-center justify-center -mt-5 w-10 h-10 rounded-xs bg-blue-900 text-white border border-blue-950 shadow-md hover:bg-blue-950 active:scale-95 transition-all"
        title={t('ctaReport')}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </Link>

      <Link
        to="/my-reports"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/my-reports') ? 'text-blue-950 font-black' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FolderOpen className="w-4.5 h-4.5" />
        <span>{t('navMyReports')}</span>
      </Link>

      <Link
        to="/settings"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/settings') ? 'text-blue-950 font-black' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <User className="w-4.5 h-4.5" />
        <span>{t('navSettings')}</span>
      </Link>
    </div>
  )
}

