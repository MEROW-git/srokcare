import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ReportCategory } from '@/types/report'
import { reportService } from '@/services/reportService'
import { CAMBODIA_PROVINCES } from '@/data/provinces'
import { useTranslation } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { LocationPickerMap } from '@/components/map/LocationPickerMap'
import { CategoryIcon } from '@/components/common/CategoryIcon'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'

const CATEGORIES: ReportCategory[] = [
  'ROAD_DAMAGE',
  'STREETLIGHT',
  'GARBAGE',
  'FLOODING',
  'DRAINAGE',
  'TRAFFIC_SAFETY',
  'PUBLIC_FACILITY',
  'OTHER',
]

const reportSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(120, { message: 'Title cannot exceed 120 characters' }),
  description: z
    .string()
    .min(15, { message: 'Description must be at least 15 characters' })
    .max(2000, { message: 'Description is too long' }),
  category: z.enum([
    'ROAD_DAMAGE',
    'STREETLIGHT',
    'GARBAGE',
    'FLOODING',
    'DRAINAGE',
    'TRAFFIC_SAFETY',
    'PUBLIC_FACILITY',
    'OTHER',
  ]),
  province: z.string().min(1, { message: 'Please select a province' }),
  district: z.string().min(1, { message: 'Please select or enter a district' }),
  address: z.string().optional(),
  latitude: z.number().min(9).max(15),
  longitude: z.number().min(102).max(108),
})

type ReportFormData = z.infer<typeof reportSchema>

export const CreateReportPage: React.FC = () => {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'ROAD_DAMAGE',
      province: 'Phnom Penh',
      district: 'Chamkarmon',
      address: '',
      latitude: 11.5564,
      longitude: 104.9282,
    },
  })

  const selectedProvince = watch('province')
  const currentLatitude = watch('latitude')
  const currentLongitude = watch('longitude')

  // Find districts for chosen province
  const currentProvinceData = CAMBODIA_PROVINCES.find((p) => p.en === selectedProvince)
  const availableDistricts = currentProvinceData?.districts || []

  // Handle Photo selection (converts to data URL for preview and local storage persistence)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null)
    const files = e.target.files
    if (!files || files.length === 0) return

    if (uploadedPhotos.length + files.length > 5) {
      setPhotoError('You can upload a maximum of 5 photos per report.')
      return
    }

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setPhotoError('Only JPEG, PNG, or WebP images are allowed.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError(`"${file.name}" exceeds 5MB size limit.`)
        return
      }
      validFiles.push(file)
    }

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setUploadedPhotos((prev) => [...prev, uploadEvent.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ReportFormData) => {
    if (!user) {
      toast.error('You need a nickname session to submit a report.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await reportService.createReport(
        {
          title: data.title,
          description: data.description,
          category: data.category,
          province: data.province,
          district: data.district,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          images:
            uploadedPhotos.length > 0
              ? uploadedPhotos
              : [
                  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
                ],
        },
        user
      )

      toast.success('Report submitted successfully!')
      navigate(`/reports/${created.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit report. Please check required fields.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <DisclaimerBanner />

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Civic Issue Submission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('createReportTitle')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t('createReportSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Issue Category Radio/Tiles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {t('fieldCategory')} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = watch('category') === cat
                const key = `cat_${cat}` as any
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setValue('category', cat)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CategoryIcon category={cat} className="w-4 h-4" />
                    </div>
                    <span className="truncate">{t(key)}</span>
                  </button>
                )
              })}
            </div>
            {errors.category && (
              <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.category.message}
              </p>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('fieldTitle')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={t('fieldTitlePlaceholder')}
              className={`w-full px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border ${
                errors.title ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all text-slate-900 font-medium`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('fieldDescription')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder={t('fieldDescriptionPlaceholder')}
              className={`w-full px-4 py-3 text-sm bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border ${
                errors.description ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all text-slate-900 leading-relaxed`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
              </p>
            )}
          </div>

          {/* Location Details: Province, District, Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('fieldProvince')} <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('province')}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
              >
                {CAMBODIA_PROVINCES.map((p) => (
                  <option key={p.en} value={p.en}>
                    {language === 'km' ? p.km : p.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('fieldDistrict')} <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('district')}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
              >
                {availableDistricts.map((d) => (
                  <option key={d.en} value={d.en}>
                    {language === 'km' ? d.km : d.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('fieldAddress')}
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder={t('fieldAddressPlaceholder')}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Interactive Location Picker Map */}
          <div className="pt-2">
            <LocationPickerMap
              latitude={currentLatitude}
              longitude={currentLongitude}
              onLocationChange={(lat, lng) => {
                setValue('latitude', lat)
                setValue('longitude', lng)
              }}
            />
          </div>

          {/* Photos Upload Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('fieldPhotos')}
              </label>
              <span className="text-xs text-slate-400">Up to 5 images (JPEG, PNG, 5MB max)</span>
            </div>

            <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/60 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploadedPhotos.length >= 5}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">{t('uploadDropzone')}</p>
                <p className="text-xs text-slate-400">{t('photosHelp')}</p>
              </div>
            </div>

            {photoError && (
              <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {photoError}
              </p>
            )}

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 group">
                    <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-xs"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('submitting')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('submitReport')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
