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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <DisclaimerBanner />

      <div className="bg-white rounded-md border border-slate-300 shadow-xs p-6 sm:p-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 mb-7">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-semibold tracking-wider uppercase mb-2">
            <Camera className="w-3.5 h-3.5 text-blue-700" />
            <span>Civic Incident Submission Form • ពាក្យបណ្តឹងសហគមន៍</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('createReportTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{t('createReportSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Issue Category Radio/Tiles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {t('fieldCategory')} <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = watch('category') === cat
                const key = `cat_${cat}` as any
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setValue('category', cat)}
                    className={`flex items-center gap-2 p-2.5 rounded-xs border text-xs font-semibold transition-colors text-left ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`p-1 rounded-xs ${
                        isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{t(key)}</span>
                  </button>
                )
              })}
            </div>
            {errors.category && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.category.message}
              </p>
            )}
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('fieldTitle')} <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={t('fieldTitlePlaceholder')}
              className={`w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white rounded-sm border ${
                errors.title ? 'border-rose-400' : 'border-slate-300'
              } focus:border-slate-800 outline-hidden transition-colors text-slate-900 font-medium`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('fieldDescription')} <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder={t('fieldDescriptionPlaceholder')}
              className={`w-full px-3 py-2 text-sm bg-slate-50 focus:bg-white rounded-sm border ${
                errors.description ? 'border-rose-400' : 'border-slate-300'
              } focus:border-slate-800 outline-hidden transition-colors text-slate-900 leading-relaxed`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
              </p>
            )}
          </div>

          {/* Location Details: Province, District, Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('fieldProvince')} <span className="text-rose-600">*</span>
              </label>
              <select
                {...register('province')}
                className="w-full px-2.5 py-2 text-xs font-medium text-slate-800 bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800"
              >
                {CAMBODIA_PROVINCES.map((p) => (
                  <option key={p.en} value={p.en}>
                    {language === 'km' ? p.km : p.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('fieldDistrict')} <span className="text-rose-600">*</span>
              </label>
              <select
                {...register('district')}
                className="w-full px-2.5 py-2 text-xs font-medium text-slate-800 bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800"
              >
                {availableDistricts.map((d) => (
                  <option key={d.en} value={d.en}>
                    {language === 'km' ? d.km : d.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t('fieldAddress')}
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder={t('fieldAddressPlaceholder')}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 focus:bg-white rounded-sm border border-slate-300 outline-hidden focus:border-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Interactive Location Picker Map */}
          <div className="pt-1">
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
              <span className="text-xs font-mono text-slate-500">MAX 5 IMAGES • JPEG, PNG, WEBP (5MB MAX)</span>
            </div>

            <div className="relative border border-dashed border-slate-300 hover:border-slate-600 rounded-sm p-6 text-center bg-slate-50/70 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploadedPhotos.length >= 5}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                <div className="w-9 h-9 rounded-xs bg-slate-200 text-slate-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">{t('uploadDropzone')}</p>
                <p className="text-[11px] text-slate-500">{t('photosHelp')}</p>
              </div>
            </div>

            {photoError && (
              <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {photoError}
              </p>
            )}

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-3">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative rounded-xs overflow-hidden aspect-square border border-slate-300 group">
                    <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-xs bg-slate-900/80 text-white hover:bg-rose-700 transition-colors shadow-2xs"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-sm hover:bg-slate-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-sm shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('submitting')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
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
