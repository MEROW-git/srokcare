import React from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface DisclaimerBannerProps {
  className?: string
  compact?: boolean
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ className = '', compact = false }) => {
  const { t } = useTranslation()

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-800 ${className}`}>
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="line-clamp-1">{t('disclaimer')}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-100/90 text-xs sm:text-sm text-blue-900 leading-relaxed ${className}`}>
      <div className="p-1 rounded-md bg-blue-100 text-blue-700 shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div>
        <span className="font-semibold text-blue-950 mr-1.5">Civic Community Platform:</span>
        {t('disclaimer')}
      </div>
    </div>
  )
}
