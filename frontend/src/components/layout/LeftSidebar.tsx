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
    <aside className="w-64 shrink-0 space-y-6">
      {/* Primary Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>{t('navHome')}</span>
        </Link>
        <Link
          to="/feed"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isActive('/feed') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-slate-500" />
          <span>{t('navFeed')}</span>
        </Link>
        <Link
          to="/map"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isActive('/map') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4 text-slate-500" />
          <span>{t('navMap')}</span>
        </Link>
        <Link
          to="/reports/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('ctaReport')}</span>
        </Link>
        <Link
          to="/my-reports"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isActive('/my-reports') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <span>{t('navMyReports')}</span>
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isActive('/admin')
                ? 'bg-amber-50 text-amber-700'
                : 'text-slate-700 hover:bg-amber-50/70 hover:text-amber-700'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-500" />
            <span>{t('navAdmin')}</span>
          </Link>
        )}
      </div>

      {/* Categories Filter Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
          {t('categoriesTitle')}
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory && onSelectCategory('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
              selectedCategory === 'ALL'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <CategoryIcon
                  category={cat}
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
                />
                <span className="truncate">{t(key)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* User Status / Quick Profile Card */}
      {isAuthenticated && user ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <Avatar nickname={user.nickname} size="md" />
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-slate-900 truncate">{user.nickname}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <Link
              to="/settings"
              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{t('navSettings')}</span>
            </Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium"
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
