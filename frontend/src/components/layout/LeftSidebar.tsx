import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Compass,
  PlusCircle,
  FolderOpen,
  Shield,
  Settings,
  Globe,
  Home,
} from 'lucide-react'
import type { ReportCategory } from '@/types/report'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { CategoryIcon } from '@/components/common/CategoryIcon'

interface LeftSidebarProps {
  selectedCategory?: ReportCategory | 'ALL'
  onSelectCategory?: (category: ReportCategory | 'ALL') => void
}

const CATEGORIES_LIST: ReportCategory[] = [
  'ROAD_DAMAGE',
  'STREETLIGHT',
  'GARBAGE',
  'FLOODING',
  'DRAINAGE',
  'TRAFFIC_SAFETY',
  'PUBLIC_FACILITY',
  'OTHER',
]

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedCategory = 'ALL',
  onSelectCategory,
}) => {
  const { t, language, toggleLanguage } = useTranslation()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="w-64 shrink-0 space-y-4">
      {/* Primary Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-2 shadow-2xs space-y-0.5 transition-colors duration-150">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/')
              ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-l-2 border-blue-900 dark:border-blue-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{t('navHome')}</span>
        </Link>
        <Link
          to="/feed"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/feed')
              ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-l-2 border-blue-900 dark:border-blue-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{t('navFeed')}</span>
        </Link>
        <Link
          to="/map"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/map')
              ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-l-2 border-blue-900 dark:border-blue-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{t('navMap')}</span>
        </Link>
        <Link
          to="/reports/new"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider bg-blue-900 dark:bg-blue-600 text-white shadow-2xs hover:bg-blue-950 dark:hover:bg-blue-500 border border-blue-950 dark:border-blue-500 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('ctaReport')}</span>
        </Link>
        <Link
          to="/my-reports"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/my-reports')
              ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-l-2 border-blue-900 dark:border-blue-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{t('navMyReports')}</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
              isActive('/admin')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-l-2 border-amber-800 dark:border-amber-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900 dark:hover:text-amber-300'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>{t('navAdmin')}</span>
          </Link>
        )}
      </div>

      {/* Categories Filter Box */}
      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-3.5 shadow-2xs transition-colors duration-150">
        <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 px-1 border-b border-slate-200 dark:border-slate-800 pb-1">
          {t('categoriesTitle')}
        </h3>
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectCategory && onSelectCategory('ALL')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors text-left ${
              selectedCategory === 'ALL'
                ? 'bg-blue-900 dark:bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{t('cat_ALL')}</span>
          </button>
          {CATEGORIES_LIST.map((cat) => {
            const key = `cat_${cat}` as const
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xs text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 font-bold border-l-2 border-blue-900 dark:border-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CategoryIcon
                  category={cat}
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-900 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                />
                <span className="truncate">{t(key)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* User Status / Quick Profile Card */}
      {isAuthenticated && user ? (
        <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-3 shadow-2xs space-y-2.5 transition-colors duration-150">
          <div className="flex items-center gap-2.5">
            <Avatar nickname={user.nickname} size="md" />
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.nickname}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/settings"
              className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t('navSettings')}</span>
            </Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'ខ្មែរ' : 'EN'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
