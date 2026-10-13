import React, { useState } from 'react'
import {
  Globe,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/common/Avatar'
import { MfaSettings } from '@/components/auth/MfaSettings'
import { isMockMode } from '@/services/apiClient'

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage } = useTranslation()
  const { user, updateNickname } = useAuth()

  const [nicknameInput, setNicknameInput] = useState(user?.nickname || 'SOK Citizen')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nicknameInput.trim()) {
      toast.error('Nickname cannot be empty.')
      return
    }
    updateNickname(nicknameInput.trim())
    setIsSaved(true)
    toast.success('Nickname updated successfully!')
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('settingsSubtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-8">
        {/* Public Pseudonymous Identity Preview */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/40 border border-blue-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar nickname={nicknameInput} size="lg" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {t('publicIdentityPreview')}
              </p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {nicknameInput.trim() || 'Anonymous'}
              </h3>
              <p className="text-xs text-slate-500">
                Visible to all users on your reports and comments
              </p>
            </div>
          </div>
        </div>

        {/* Form: Change Nickname */}
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('nicknameField')}
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter your public nickname"
              className="w-full max-w-md px-4 py-2.5 text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden font-medium"
            />
            <p className="text-xs text-slate-400 mt-1">{t('nicknameHelp')}</p>
          </div>

          {/* Language Preference */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Language Preference / ភាសា
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('km')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  language === 'km'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>ភាសាខ្មែរ (Khmer)</span>
              </button>
            </div>
          </div>

          {/* Privacy & Account Information */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Private Account Information</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5 max-w-md">
              <div className="flex justify-between">
                <span className="text-slate-400">Account ID:</span>
                <span className="font-mono">{user?.id || 'usr-demo-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Email:</span>
                <span className="font-mono text-slate-700">{user?.email || 'private@email.local'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Type:</span>
                <span className="font-semibold text-blue-600">{user?.role || 'USER'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Your registered email is strictly private and never shown to other users.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-start gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-500/20 transition-all"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Saved!' : t('saveSettings')}</span>
            </button>
          </div>
        </form>
      </div>
      {!isMockMode() && <MfaSettings />}
    </div>
  )
}
