import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, UserCheck, AlertCircle, Building2, CheckCircle2, Lock } from 'lucide-react'
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

  const mock = isMockMode()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: mock ? 'sok.citizen@fixkh-demo.local' : '',
      password: mock ? 'password123' : '',
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
      toast.error('Invalid credentials. Please verify your email and password.')
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
    <div className="py-8 sm:py-12 transition-colors duration-150">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Civic Identity Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-[11px] font-semibold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                <span className="w-1.5 h-1.5 rounded-xs bg-blue-700 dark:bg-blue-400"></span>
                FixKH Civic Portal • ច្រកចូលសហគមន៍
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Community Issue Reporting
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Share local infrastructure issues with your community and track the status of submitted reports.
              </p>
            </div>

            {/* Structured Civic Pillars */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                Civic Standards & Protection Charter
              </div>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">Pseudonymous Participation:</strong> Real identities are shielded. Reports are published under your chosen nickname to encourage fearless community improvement.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">Location-based Reports:</strong> Pin potholes, drainage failures, trash build-ups, streetlights, and traffic hazards on the map.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-slate-700 dark:text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100 font-semibold">Two-Factor Security:</strong> Optional authenticator app MFA helps protect your account.
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-6 space-y-4">
            {/* Quick Demo Access Card - ONLY in mock mode */}
            {mock && (
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    <span className="w-2 h-2 rounded-xs bg-amber-500"></span>
                    <span>Demo Mode Enabled</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Mock Sandbox</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bypass manual input to test civic roles directly in this preview environment:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleQuickDemoUser}
                    className="px-3 py-2 rounded-sm bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <span>SOK Citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDemoAdmin}
                    className="px-3 py-2 rounded-sm bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs border border-blue-950 dark:border-blue-500 shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Moderator Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Card */}
            <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {t('loginTitle')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {mock ? t('loginSubtitle') : 'Enter your registered credentials to access your civic account.'}
                </p>
              </div>

              {mfaChallenge ? (
                <form onSubmit={onMfaSubmit} className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-sm p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="font-bold">Two-Factor Authentication Required</div>
                    <div>Enter the 6-digit verification code from your authenticator app, or a recovery code.</div>
                  </div>
                  <div>
                    <label htmlFor="mfa-login-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Authenticator / Recovery Code
                    </label>
                    <input
                      id="mfa-login-code"
                      value={mfaCode}
                      onChange={(event) => setMfaCode(event.target.value)}
                      autoComplete="one-time-code"
                      maxLength={32}
                      required
                      autoFocus
                      placeholder="e.g. 123456"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-blue-500 outline-hidden font-mono tracking-wider text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm transition-colors disabled:opacity-50 border border-blue-950 dark:border-blue-500 uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify and Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMfaChallenge(null); setMfaCode('') }}
                    className="w-full py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Return to Password Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t('emailField')}
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="name@example.com"
                      className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border ${
                        errors.email ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                      } focus:border-slate-800 dark:focus:border-blue-500 outline-hidden transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {t('passwordField')}
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="••••••••"
                        className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border ${
                          errors.password ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                        } focus:border-slate-800 dark:focus:border-blue-500 outline-hidden transition-colors pr-9 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 active:bg-blue-950 rounded-sm shadow-xs transition-colors disabled:opacity-50 mt-1 border border-blue-950 dark:border-blue-500 uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Signing in...' : t('loginBtn')}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('noAccount')}{' '}
                <Link to="/register" className="font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline">
                  {t('registerBtn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
