import React from 'react'
import { Info, ShieldAlert } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface DisclaimerBannerProps {
  className?: string
  compact?: boolean
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ className = '', compact = false }) => {
  const { t } = useTranslation()

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-sm bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 transition-colors duration-150 ${className}`}>
        <Info className="w-3.5 h-3.5 text-blue-800 dark:text-blue-400 shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Civic Notice:</span>
        <span className="line-clamp-1 text-slate-700 dark:text-slate-300">{t('disclaimer')}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed transition-colors duration-150 ${className}`}>
      <div className="p-1.5 rounded-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0 mt-0.5 border border-slate-300 dark:border-slate-700">
        <ShieldAlert className="w-4 h-4 text-slate-900 dark:text-slate-100" />
      </div>
      <div>
        <span className="font-bold text-slate-900 dark:text-slate-100 mr-1.5 uppercase tracking-wider text-[11px] block sm:inline">
          Independent Civic Notice:
        </span>
        <span className="text-slate-700 dark:text-slate-300">{t('disclaimer')}</span>
      </div>
    </div>
  )
}
