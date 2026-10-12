import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'

const registerSchema = z
  .object({
    nickname: z
      .string()
      .min(2, { message: 'Nickname must be at least 2 characters' })
      .max(40, { message: 'Nickname cannot exceed 40 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const { register: registerAuth } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
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
      await registerAuth({
        nickname: data.nickname,
        email: data.email,
        password: data.password,
      })
      toast.success(`Welcome to FixKH, ${data.nickname}!`)
      navigate('/feed')
    } catch {
      toast.error('Registration failed. Please try again.')
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="At least 6 characters"
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
          </form>

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
