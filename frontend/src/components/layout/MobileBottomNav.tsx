import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Compass, Plus, FolderOpen, User } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-md transition-colors duration-150">
      <Link
        to="/feed"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/feed') ? 'text-blue-950 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <LayoutGrid className="w-4.5 h-4.5" />
        <span>{t('navFeed')}</span>
      </Link>

      <Link
        to="/map"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/map') ? 'text-blue-950 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Compass className="w-4.5 h-4.5" />
        <span>{t('navMap')}</span>
      </Link>

      {/* Structured Plus CTA */}
      <Link
        to="/reports/new"
        className="flex items-center justify-center -mt-5 w-10 h-10 rounded-xs bg-blue-900 dark:bg-blue-600 text-white border border-blue-950 dark:border-blue-500 shadow-md hover:bg-blue-950 dark:hover:bg-blue-500 active:scale-95 transition-all"
        title={t('ctaReport')}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </Link>

      <Link
        to="/my-reports"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/my-reports') ? 'text-blue-950 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <FolderOpen className="w-4.5 h-4.5" />
        <span>{t('navMyReports')}</span>
      </Link>

      <Link
        to="/settings"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          isActive('/settings') ? 'text-blue-950 dark:text-blue-400 font-black' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <User className="w-4.5 h-4.5" />
        <span>{t('navSettings')}</span>
      </Link>
    </div>
  )
}
