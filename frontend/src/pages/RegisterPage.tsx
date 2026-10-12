import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('registerTitle')}
          </h1>
          <p className="text-sm text-slate-600">{t('registerSubtitle')}</p>
        </div>

        {/* Privacy Notice Box */}
        <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block text-blue-950">Pseudonymous Civic Participation:</span>
            {t('privacyNotice')} Real names are never requested or required.
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          {pendingEmail ? (
            <form onSubmit={onVerify} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">{t('verifyEmailTitle')}</h2>
              <p className="text-sm text-slate-600">{t('verifyEmailHelp')}</p>
              <p className="text-sm font-medium text-slate-800 break-all">{pendingEmail}</p>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="registration-code">
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
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 text-lg tracking-widest text-center bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              />
              <button type="submit" disabled={isSubmitting || code.length !== 6}
                className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50">
                {t('verifyEmailBtn')}
              </button>
              <button type="button" onClick={resendCode} disabled={isSubmitting}
                className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50">
                {t('resendCodeBtn')}
              </button>
              <button type="button" onClick={() => { setPendingEmail(null); setCode('') }}
                className="w-full text-xs text-slate-500 hover:text-slate-700">Edit registration details</button>
            </form>
          ) : <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nickname field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('nicknameField')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('nickname')}
                placeholder="e.g. SOK Citizen or សុខ ពលរដ្ឋ"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white rounded-xl border ${
                  errors.nickname ? 'border-rose-300' : 'border-slate-200'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden`}
              />
              <p className="text-[11px] text-slate-400 mt-1">{t('nicknameHelp')}</p>
              {errors.nickname && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.nickname.message}
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('emailField')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="name@example.com"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white rounded-xl border ${
                  errors.email ? 'border-rose-300' : 'border-slate-200'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden`}
              />
              <p className="text-[11px] text-slate-400 mt-1">{t('emailHelp')}</p>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('passwordField')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="At least 8 characters"
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

            {/* Confirm Password field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('confirmPasswordField')} <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Repeat password"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white rounded-xl border ${
                  errors.confirmPassword ? 'border-rose-300' : 'border-slate-200'
                } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Public Identity Preview */}
            {currentNickname && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500">Public Preview:</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                  {currentNickname}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs shadow-blue-500/20 transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Creating account...' : t('registerBtn')}
            </button>
          </form>}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            {t('alreadyAccount')}{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
              {t('loginBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
