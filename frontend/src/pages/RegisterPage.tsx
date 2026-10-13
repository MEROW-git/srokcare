import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, AlertCircle, User, KeyRound, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import axios from 'axios'

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
    ? error.response.data.message
    : fallback

const registerSchema = z
  .object({
    nickname: z
      .string()
      .min(2, { message: 'Nickname must be at least 2 characters' })
      .max(40, { message: 'Nickname cannot exceed 40 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const { register: registerAuth, verifyRegistration } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [code, setCode] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const currentNickname = watch('nickname')

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    try {
      const complete = await registerAuth({
        nickname: data.nickname,
        email: data.email,
        password: data.password,
      })
      if (complete) {
        toast.success(`Welcome to FixKH, ${data.nickname}!`)
        navigate('/feed')
      } else {
        setPendingEmail(data.email)
        toast.success(t('codeSentNotice'))
      }
    } catch (error) {
      toast.error(errorMessage(error, 'Registration failed. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onVerify = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!pendingEmail || !/^[0-9]{6}$/.test(code)) return
    setIsSubmitting(true)
    try {
      const details = getValues()
      await verifyRegistration({ nickname: details.nickname, email: pendingEmail, password: details.password, code })
      toast.success(`Welcome to FixKH, ${details.nickname}!`)
      navigate('/feed')
    } catch (error) {
      toast.error(errorMessage(error, 'Verification failed. Check the code and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resendCode = async () => {
    if (!pendingEmail) return
    setIsSubmitting(true)
    try {
      await authService.resendRegistrationCode(pendingEmail)
      setCode('')
      toast.success(t('codeSentNotice'))
    } catch (error) {
      toast.error(errorMessage(error, 'Could not send a new code. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-8 sm:py-12 transition-colors duration-150">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Civic Information Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs text-[11px] font-semibold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                <span className="w-1.5 h-1.5 rounded-xs bg-emerald-600 dark:bg-emerald-400"></span>
                Citizen Registration • ចុះឈ្មោះពលរដ្ឋ
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                Join Cambodia's Community Improvement Network
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Create an account to report public infrastructure issues, upvote community concerns, and receive verified updates from municipal teams.
              </p>
            </div>

            {/* Pseudonymous Civic Identity Notice */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Pseudonymous Civic Participation</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('privacyNotice')} You can report without fear: real names and personal identities are never made public. Only your chosen nickname appears alongside incident submissions and votes.
              </p>
            </div>

            {/* 3 Step Process Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md p-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                How Registration Works
              </div>
              <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span><strong className="text-slate-900 dark:text-slate-100">Choose a Pseudonym:</strong> Select any civic nickname (English or Khmer script supported).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span><strong className="text-slate-900 dark:text-slate-100">Verify Your Email:</strong> We send a 6-digit one-time code to prevent spam and abuse.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span><strong className="text-slate-900 dark:text-slate-100">Report & Monitor:</strong> Pin location on map, attach photos, and receive official resolution notifications.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
              {pendingEmail ? (
                <form onSubmit={onVerify} className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-400">
                      <Mail className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <span>{t('verifyEmailTitle')}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('verifyEmailHelp')}</p>
                    <div className="mt-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xs font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
                      {pendingEmail}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1" htmlFor="registration-code">
                      {t('verificationCodeField')}
                    </label>
                    <input
                      id="registration-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      placeholder="000000"
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-lg tracking-widest text-center bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-blue-500 outline-hidden font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || code.length !== 6}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-sm shadow-xs transition-colors disabled:opacity-50 border border-blue-950 dark:border-blue-500 uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Verifying...' : t('verifyEmailBtn')}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={resendCode}
                      disabled={isSubmitting}
                      className="font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                      {t('resendCodeBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPendingEmail(null); setCode('') }}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      Edit details
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                      {t('registerTitle')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('registerSubtitle')}</p>
                  </div>

                  {/* Nickname field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t('nicknameField')} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('nickname')}
                        placeholder="e.g. SOK Citizen or សុខ ពលរដ្ឋ"
                        className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border ${
                          errors.nickname ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                        } focus:border-slate-800 dark:focus:border-blue-500 outline-hidden transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                      />
                      <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('nicknameHelp')}</p>
                    {errors.nickname && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.nickname.message}
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t('emailField')} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="name@example.com"
                        className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border ${
                          errors.email ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                        } focus:border-slate-800 dark:focus:border-blue-500 outline-hidden transition-colors text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                      />
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t('emailHelp')}</p>
                    {errors.email && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t('passwordField')} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="At least 8 characters"
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

                  {/* Confirm Password field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      {t('confirmPasswordField')} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        placeholder="Repeat password"
                        className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-sm border ${
                          errors.confirmPassword ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                        } focus:border-slate-800 dark:focus:border-blue-500 outline-hidden transition-colors pr-9 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Public Identity Preview */}
                  {currentNickname && (
                    <div className="p-2.5 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Public Badge Preview:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                        {currentNickname}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-500 active:bg-blue-950 rounded-sm shadow-xs transition-colors disabled:opacity-50 mt-1 border border-blue-950 dark:border-blue-500 uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Creating account...' : t('registerBtn')}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                {t('alreadyAccount')}{' '}
                <Link to="/login" className="font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline">
                  {t('loginBtn')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
