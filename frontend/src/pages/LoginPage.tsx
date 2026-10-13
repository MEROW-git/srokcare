import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Eye, EyeOff, ShieldCheck, UserCheck, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { isMockMode } from '@/services/apiClient'

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const { login, verifyMfaLogin, loginAsDemoUser, loginAsAdmin } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mfaChallenge, setMfaChallenge] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'sok.citizen@fixkh-demo.local',
      password: 'password123',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      const challenge = await login(data)
      if (challenge) {
        setMfaChallenge(challenge)
        setMfaCode('')
        return
      }
      toast.success('Signed in successfully!')
      navigate('/feed')
    } catch {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!mfaChallenge || !mfaCode.trim()) return
    setIsSubmitting(true)
    try {
      await verifyMfaLogin(mfaChallenge, mfaCode.trim())
      toast.success('Signed in successfully!')
      navigate('/feed')
    } catch {
      toast.error('Invalid or expired authenticator code. Try again or use a recovery code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickDemoUser = () => {
    loginAsDemoUser()
    toast.success('Signed in as Demo User (SOK Citizen)')
    navigate('/feed')
  }

  const handleQuickDemoAdmin = () => {
    loginAsAdmin()
    toast.success('Signed in as Civic Moderator (Admin)')
    navigate('/admin')
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-slate-600">{isMockMode() ? t('loginSubtitle') : 'Enter your email and password.'}</p>
        </div>

        {/* Quick Demo Access Card */}
        {isMockMode() && <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Instant Demo Session</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Test full citizen report submission, interactive upvoting, or civic moderation immediately:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleQuickDemoUser}
              className="px-3 py-2.5 rounded-xl bg-white hover:bg-blue-600 text-slate-800 hover:text-white font-semibold text-xs border border-blue-200 shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>SOK Citizen</span>
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Moderator Admin</span>
            </button>
          </div>
        </div>}

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          {mfaChallenge && (
            <form onSubmit={onMfaSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Authenticator code</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Enter the six-digit code from your authenticator app, or one of your recovery codes.
                </p>
              </div>
              <label htmlFor="mfa-login-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Code
              </label>
              <input id="mfa-login-code" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)}
                autoComplete="one-time-code" maxLength={32} required autoFocus
                className="w-full px-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden font-mono tracking-wider" />
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50">
                {isSubmitting ? 'Verifying...' : 'Verify and sign in'}
              </button>
              <button type="button" onClick={() => { setMfaChallenge(null); setMfaCode('') }}
                className="w-full text-sm text-slate-600 hover:text-slate-900">Back to password</button>
            </form>
          )}
          {!mfaChallenge && <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('emailField')}
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="name@example.com"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white rounded-xl border ${
                  errors.email ? 'border-rose-300' : 'border-slate-200'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden`}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('passwordField')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white rounded-xl border ${
                    errors.password ? 'border-rose-300' : 'border-slate-200'
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Signing in...' : t('loginBtn')}
            </button>
          </form>}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {t('noAccount')}{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              {t('registerBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
