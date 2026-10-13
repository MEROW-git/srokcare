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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{t('settingsSubtitle')}</p>
      </div>

      <div className="bg-white rounded-md border border-slate-300 shadow-xs p-6 sm:p-7 space-y-6">
        {/* Public Pseudonymous Identity Preview */}
        <div className="p-4 rounded-xs bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar nickname={nicknameInput} size="lg" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {t('publicIdentityPreview')}
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {nicknameInput.trim() || 'Anonymous'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Visible to municipal dispatchers and community members on your reports and comments
              </p>
            </div>
          </div>
        </div>

        {/* Form: Change Nickname */}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t('nicknameField')}
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Enter your public nickname"
              className="w-full max-w-md px-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-sm border border-slate-300 focus:border-slate-800 outline-hidden font-medium transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">{t('nicknameHelp')}</p>
          </div>

          {/* Language Preference */}
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Language Preference / ភាសា
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-w-md">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center gap-2 p-2 rounded-xs border text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
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
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ភាសាខ្មែរ (Khmer)</span>
              </button>
            </div>
          </div>

          {/* Privacy & Account Information */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Private Account Record</span>
            </div>
            <div className="p-3.5 rounded-xs bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 max-w-md font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase text-[11px]">Account ID:</span>
                <span className="text-slate-900">{user?.id || 'usr-demo-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase text-[11px]">Registered Email:</span>
                <span className="text-slate-900">{user?.email || 'private@email.local'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 uppercase text-[11px]">Civic Role:</span>
                <span className="font-semibold text-blue-800">{user?.role || 'CITIZEN'}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Your registered email is strictly private and never exposed to the public feed.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-start gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors uppercase tracking-wider"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved!' : t('saveSettings')}</span>
            </button>
          </div>
        </form>
      </div>
      {!isMockMode() && <MfaSettings />}
    </div>

  )
}
