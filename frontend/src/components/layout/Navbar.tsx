import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  MapPin,
  PlusCircle,
  Compass,
  LayoutGrid,
  Menu,
  X,
  Globe,
  Shield,
  LogOut,
  FolderOpen,
  Settings,
  User as UserIcon,
} from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export const Navbar: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 shadow-2xs transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 rounded-xs bg-blue-900 dark:bg-blue-600 text-white flex items-center justify-center border border-blue-950 dark:border-blue-500 group-hover:bg-blue-950 dark:group-hover:bg-blue-500 transition-colors shadow-2xs">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                Fix<span className="text-blue-900 dark:text-blue-400">KH</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xs uppercase tracking-wider">
                Civic
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block tracking-normal">
              {t('appTagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/feed"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/feed')
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-b-2 border-blue-900 dark:border-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('navFeed')}</span>
          </Link>
          <Link
            to="/map"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/map')
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-b-2 border-blue-900 dark:border-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('navMap')}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${
                isActive('/admin')
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-b-2 border-amber-800 dark:border-amber-400'
                  : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-50/70 dark:hover:bg-amber-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>{t('navAdmin')}</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title={`Switch to ${language === 'en' ? 'Khmer' : 'English'}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xs transition-colors border border-slate-300 dark:border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>{language === 'en' ? 'ខ្មែរ (KM)' : 'English (EN)'}</span>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle variant="dropdown" />

          {/* Create Report Button CTA */}
          <Link
            to="/reports/new"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm shadow-2xs border border-blue-950 dark:border-blue-500 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('ctaReport')}</span>
          </Link>

          {/* User Account / Auth Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
              >
                <Avatar nickname={user.nickname} avatarUrl={user.avatarUrl} size="sm" />
                <span className="hidden lg:inline text-xs font-bold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                  {user.nickname}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-sm shadow-md border border-slate-300 dark:border-slate-800 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Public Identity
                      </p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white truncate">
                        {user.nickname}
                      </p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xs">
                        {user.role === 'ADMIN' ? 'Civic Moderator' : 'Citizen'}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{t('navViewProfile')}</span>
                    </Link>

                    <Link
                      to="/my-reports"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{t('navMyReports')}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>{t('navAdmin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{t('navSettings')}</span>
                    </Link>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm border border-slate-300 dark:border-slate-700 transition-colors"
              >
                {t('navLogin')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors border border-blue-950 dark:border-blue-500 shadow-2xs"
              >
                {t('navRegister')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          {/* Mobile Theme & Language Controls */}
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('theme')}
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          <Link
            to="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider ${
              isActive('/feed')
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-l-2 border-blue-900 dark:border-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('navFeed')}</span>
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider ${
              isActive('/map')
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-blue-300 border-l-2 border-blue-900 dark:border-blue-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('navMap')}</span>
          </Link>
          <Link
            to="/reports/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider bg-blue-900 dark:bg-blue-600 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('ctaReport')}</span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{t('navProfile')}</span>
            </Link>
          )}
          <Link
            to="/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('navMyReports')}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <Shield className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>{t('navAdmin')}</span>
            </Link>
          )}
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('navSettings')}</span>
          </Link>
        </div>
      )}
    </header>
  )
}
