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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-300 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-8 h-8 rounded-xs bg-blue-900 text-white flex items-center justify-center border border-blue-950 group-hover:bg-blue-950 transition-colors shadow-2xs">
            <MapPin className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-950">
                Fix<span className="text-blue-900">KH</span>
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded-xs uppercase tracking-wider">
                Civic
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 hidden sm:block tracking-normal">
              ថែរក្សាសហគមន៍ • {t('appTagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/feed"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/feed')
                ? 'bg-slate-100 text-blue-950 border-b-2 border-blue-900'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('navFeed')}</span>
          </Link>
          <Link
            to="/map"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${
              isActive('/map')
                ? 'bg-slate-100 text-blue-950 border-b-2 border-blue-900'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
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
                  ? 'bg-amber-100 text-amber-950 border-b-2 border-amber-800'
                  : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50/70'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:text-blue-950 bg-slate-100 hover:bg-slate-200 rounded-xs transition-colors border border-slate-300"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span>{language === 'en' ? 'ខ្មែរ (KM)' : 'English (EN)'}</span>
          </button>

          {/* Create Report Button CTA */}
          <Link
            to="/reports/new"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 rounded-sm shadow-2xs border border-blue-950 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('ctaReport')}</span>
          </Link>

          {/* User Account / Auth Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xs hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-300"
              >
                <Avatar nickname={user.nickname} size="sm" />
                <span className="hidden lg:inline text-xs font-bold text-slate-900 max-w-[120px] truncate">
                  {user.nickname}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-sm shadow-md border border-slate-300 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Public Identity
                      </p>
                      <p className="text-sm font-bold text-slate-950 truncate">
                        {user.nickname}
                      </p>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 rounded-xs">
                        {user.role === 'ADMIN' ? 'Civic Moderator' : 'Citizen'}
                      </span>
                    </div>

                    <Link
                      to="/my-reports"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('navMyReports')}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-amber-900 hover:bg-amber-50 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-700" />
                        <span>{t('navAdmin')}</span>
                      </Link>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('navSettings')}</span>
                    </Link>

                    <div className="border-t border-slate-200 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-700" />
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
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-sm border border-slate-300 transition-colors"
              >
                {t('navLogin')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-950 rounded-sm transition-colors border border-blue-950 shadow-2xs"
              >
                {t('navRegister')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-300 bg-white px-4 pt-3 pb-5 space-y-1.5">
          <Link
            to="/feed"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider ${
              isActive('/feed') ? 'bg-slate-100 text-blue-950 border-l-2 border-blue-900' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('navFeed')}</span>
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider ${
              isActive('/map') ? 'bg-slate-100 text-blue-950 border-l-2 border-blue-900' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('navMap')}</span>
          </Link>
          <Link
            to="/reports/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider bg-blue-900 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('ctaReport')}</span>
          </Link>
          <Link
            to="/my-reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
          >
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span>{t('navMyReports')}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-amber-900 hover:bg-amber-50"
            >
              <Shield className="w-4 h-4 text-amber-700" />
              <span>{t('navAdmin')}</span>
            </Link>
          )}
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>{t('navSettings')}</span>
          </Link>
        </div>
      )}
    </header>
  )
}

