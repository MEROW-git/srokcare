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
} from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Fix<span className="text-blue-600">KH</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-md uppercase tracking-wider">
                Civic
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 hidden sm:block tracking-wide">
              {t('appTagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/feed"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive('/feed')
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('navFeed')}</span>
          </Link>
          <Link
            to="/map"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive('/map')
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('navMap')}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/admin')
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/70'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>{t('navAdmin')}</span>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title={`Switch to ${language === 'en' ? 'Khmer' : 'English'}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200/60"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'ខ្មែរ (KM)' : 'English (EN)'}</span>
          </button>

          {/* Create Report Button CTA */}
          <Link
            to="/reports/new"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-600/20 transition-all hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('ctaReport')}</span>
          </Link>

          {/* User Account / Auth Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <Avatar nickname={user.nickname} size="sm" />
                <span className="hidden lg:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
                  {user.nickname}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Public Identity
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.nickname}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md">
                        {user.role === 'ADMIN' ? 'Civic Moderator' : 'Community Citizen'}
                      </span>
                    </div>

                    <Link
                      to="/my-reports"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FolderOpen className="w-4 h-4 text-slate-400" />
                      <span>{t('navMyReports')}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50/70 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>{t('navAdmin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>{t('navSettings')}</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>{t('navLogout')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('navLogin')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
              >
                {t('navRegister')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/feed') ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span>{t('navFeed')}</span>
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/map') ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>{t('navMap')}</span>
          </Link>
          <Link
            to="/reports/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('ctaReport')}</span>
          </Link>
          <Link
            to="/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FolderOpen className="w-5 h-5 text-slate-400" />
            <span>{t('navMyReports')}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              <Shield className="w-5 h-5 text-amber-500" />
              <span>{t('navAdmin')}</span>
            </Link>
          )}
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span>{t('navSettings')}</span>
          </Link>
        </div>
      )}
    </header>
  )
}
