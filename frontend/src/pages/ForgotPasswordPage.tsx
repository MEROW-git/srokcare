import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertCircle, KeyRound, Mail } from 'lucide-react'
import axios from 'axios'
import { authService } from '@/services/authService'
import { isMockMode } from '@/services/apiClient'
import { useTranslation } from '@/contexts/LanguageContext'

const fieldClass = 'w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-blue-700 dark:focus:border-blue-500 outline-hidden text-slate-900 dark:text-slate-100'

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const state = location.state as { email?: string; from?: string } | null
  const [email, setEmail] = useState(state?.email || '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'request' | 'reset' | 'complete'>('request')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mock = isMockMode()

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await authService.requestPasswordReset(email.trim())
      setStep('reset')
      setNotice(t('forgotPasswordCheckEmail'))
    } catch {
      setError('Could not request a reset code. Please try again later.')
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await authService.resetPassword(email.trim(), code, password)
      setPassword('')
      setConfirmPassword('')
      setCode('')
      setStep('complete')
      setNotice(t('forgotPasswordSuccess'))
    } catch (caught) {
      setError(axios.isAxiosError(caught) && typeof caught.response?.data?.message === 'string'
        ? caught.response.data.message
        : 'Could not reset your password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] bg-slate-50 dark:bg-slate-950 py-12 sm:py-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-700 text-white rounded-sm mb-4"><KeyRound className="w-5 h-5" /></div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('forgotPasswordTitle')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{t('forgotPasswordIntro')}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md p-6 shadow-xs">
          {mock ? <p className="text-sm text-slate-700 dark:text-slate-300">{t('forgotPasswordUnavailable')}</p> : step === 'complete' ? (
            <p className="text-sm text-emerald-800 dark:text-emerald-300" role="status">{notice}</p>
          ) : step === 'request' ? (
            <form onSubmit={requestCode} className="space-y-4">
              <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('emailField')}</label>
              <input id="reset-email" type="email" autoComplete="email" required maxLength={320} value={email} onChange={event => setEmail(event.target.value)} className={fieldClass} placeholder="name@example.com" />
              <button type="submit" disabled={busy} className="w-full py-2.5 text-xs font-bold uppercase text-white bg-blue-700 hover:bg-blue-800 rounded-sm disabled:opacity-50">{busy ? 'Sending...' : t('forgotPasswordSend')}</button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div className="flex gap-2 text-sm text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm p-3" role="status"><Mail className="w-4 h-4 shrink-0 mt-0.5" />{notice}</div>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">{email.trim()}</p>
              <div><label htmlFor="reset-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('verificationCodeField')}</label><input id="reset-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} className={fieldClass + ' font-mono tracking-widest'} placeholder="000000" /></div>
              <div><label htmlFor="reset-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('forgotPasswordNewPassword')}</label><input id="reset-password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={event => setPassword(event.target.value)} className={fieldClass} /></div>
              <div><label htmlFor="reset-confirm" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">{t('confirmPasswordField')}</label><input id="reset-confirm" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={fieldClass} /></div>
              <button type="submit" disabled={busy || code.length !== 6} className="w-full py-2.5 text-xs font-bold uppercase text-white bg-blue-700 hover:bg-blue-800 rounded-sm disabled:opacity-50">{busy ? 'Saving...' : t('forgotPasswordReset')}</button>
              <button type="button" onClick={() => { setStep('request'); setCode(''); setError('') }} className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline">{t('forgotPasswordTryAgain')}</button>
            </form>
          )}
          {error && <p role="alert" className="flex items-center gap-1 mt-4 text-xs text-rose-700 dark:text-rose-400"><AlertCircle className="w-4 h-4" />{error}</p>}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center"><Link to="/login" state={{ from: state?.from }} className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline">{t('forgotPasswordBack')}</Link></div>
        </div>
      </div>
    </div>
  )
}
