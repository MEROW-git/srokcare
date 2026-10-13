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
      <div className="bg-white rounded-md border border-slate-300 p-2 shadow-2xs space-y-0.5">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/') ? 'bg-slate-100 text-blue-950 border-l-2 border-blue-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>{t('navHome')}</span>
        </Link>
        <Link
          to="/feed"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/feed') ? 'bg-slate-100 text-blue-950 border-l-2 border-blue-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-slate-500" />
          <span>{t('navFeed')}</span>
        </Link>
        <Link
          to="/map"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/map') ? 'bg-slate-100 text-blue-950 border-l-2 border-blue-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-slate-500" />
          <span>{t('navMap')}</span>
        </Link>
        <Link
          to="/reports/new"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider bg-blue-900 text-white shadow-2xs hover:bg-blue-950 border border-blue-950 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('ctaReport')}</span>
        </Link>
        <Link
          to="/my-reports"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
            isActive('/my-reports') ? 'bg-slate-100 text-blue-950 border-l-2 border-blue-900' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <span>{t('navMyReports')}</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors ${
              isActive('/admin')
                ? 'bg-amber-100 text-amber-950 border-l-2 border-amber-800'
                : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-700" />
            <span>{t('navAdmin')}</span>
          </Link>
        )}
      </div>

      {/* Categories Filter Box */}
      <div className="bg-white rounded-md border border-slate-300 p-3.5 shadow-2xs">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1 border-b border-slate-200 pb-1">
          {t('categoriesTitle')}
        </h3>
        <div className="space-y-0.5">
          <button
            onClick={() => onSelectCategory && onSelectCategory('ALL')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors text-left ${
              selectedCategory === 'ALL'
                ? 'bg-blue-900 text-white'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
                    ? 'bg-slate-100 text-blue-950 font-bold border-l-2 border-blue-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CategoryIcon
                  category={cat}
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-900' : 'text-slate-500'}`}
                />
                <span className="truncate">{t(key)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* User Status / Quick Profile Card */}
      {isAuthenticated && user ? (
        <div className="bg-white rounded-md border border-slate-300 p-3 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar nickname={user.nickname} size="md" />
            <div className="overflow-hidden">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-bold text-slate-900 truncate">{user.nickname}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/settings"
              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-900"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t('navSettings')}</span>
            </Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-600 hover:text-blue-900"
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

