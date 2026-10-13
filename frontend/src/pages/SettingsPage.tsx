import React, { useState } from 'react'
import {
  Globe,
  Save,
  CheckCircle2,
  Lock,
  SunMoon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { MfaSettings } from '@/components/auth/MfaSettings'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { isMockMode } from '@/services/apiClient'
import { userService } from '@/services/userService'

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation()
  const { user, updateUser } = useAuth()

  const [nicknameInput, setNicknameInput] = useState(user?.nickname || 'SOK Citizen')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Sign in to save account settings.')
      return
    }
    const nickname = nicknameInput.trim()
    if (nickname.length < 2 || nickname.length > 50) {
      toast.error('Nickname must be between 2 and 50 characters.')
      return
    }
    setIsSaving(true)
    try {
      const updated = await userService.updateProfile({ nickname })
      updateUser(updated)
      setIsSaved(true)
      toast.success('Nickname updated successfully!')
      setTimeout(() => setIsSaved(false), 2500)
    } catch (error: unknown) {
      const response = error as { response?: { data?: { message?: string } } }
      toast.error(response.response?.data?.message || 'Could not save nickname.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 transition-colors duration-150">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('settingsSubtitle')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 shadow-xs p-6 sm:p-7 space-y-6">
        {/* Public Pseudonymous Identity Preview */}
        <div className="p-4 rounded-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar nickname={nicknameInput} avatarUrl={user?.avatarUrl} size="lg" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                {t('publicIdentityPreview')}
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {nicknameInput.trim() || 'Anonymous'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Visible to municipal dispatchers and community members on your reports and comments
              </p>
            </div>
          </div>
        </div>

        {/* Form: Change Nickname */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {t('nicknameField')}
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter your public nickname"
              className="w-full max-w-md px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden font-medium transition-colors"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('nicknameHelp')}</p>
          </div>

          {/* Theme Preference */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <SunMoon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t('theme')}</span>
            </label>
            <div className="max-w-md">
              <ThemeToggle variant="segmented" />
            </div>
          </div>

          {/* Language Preference */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Language Preference / ភាសា</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-w-md">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xs border text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-950 dark:border-blue-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('km')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xs border text-xs font-semibold transition-colors ${
                  language === 'km'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-950 dark:border-blue-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ភាសាខ្មែរ (Khmer)</span>
              </button>
            </div>
          </div>

          {/* Privacy & Account Information */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Private Account Record</span>
            </div>
            <div className="p-3.5 rounded-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 max-w-md font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500 uppercase text-[11px]">Account ID:</span>
                <span className="text-slate-900 dark:text-slate-100">{user?.id || 'usr-demo-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500 uppercase text-[11px]">Registered Email:</span>
                <span className="text-slate-900 dark:text-slate-100">{user?.email || 'private@email.local'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500 uppercase text-[11px]">Civic Role:</span>
                <span className="font-semibold text-blue-800 dark:text-blue-400">{user?.role || 'CITIZEN'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Your registered email is strictly private and never exposed to the public feed.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-start gap-3">
            <button
              type="submit"
              disabled={isSaving || !user}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm font-bold text-xs text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs transition-colors uppercase tracking-wider border border-blue-950 dark:border-blue-500 disabled:opacity-60"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Saving...' : isSaved ? 'Saved!' : t('saveSettings')}</span>
            </button>
          </div>
        </form>
      </div>
      {!isMockMode() && <MfaSettings />}
    </div>
  )
}
