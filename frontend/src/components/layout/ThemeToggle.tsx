import React, { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Laptop, Check } from 'lucide-react'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { useTranslation } from '@/contexts/LanguageContext'

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown' }) => {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('themeLight'), icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { value: 'dark', label: t('themeDark'), icon: <Moon className="w-3.5 h-3.5 text-blue-400" /> },
    { value: 'system', label: t('themeSystem'), icon: <Laptop className="w-3.5 h-3.5 text-slate-400" /> },
  ]

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label={t('theme')}
        className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs"
      >
        {options.map((opt) => {
          const isSelected = theme === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-2xs transition-colors ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 shadow-2xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // Current active icon for toggle trigger
  const currentIcon =
    theme === 'light' ? (
      <Sun className="w-3.5 h-3.5 text-amber-500" />
    ) : theme === 'dark' ? (
      <Moon className="w-3.5 h-3.5 text-blue-400" />
    ) : (
      <Laptop className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
    )

  const currentLabel =
    theme === 'light' ? t('themeLight') : theme === 'dark' ? t('themeDark') : t('themeSystem')

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('theme')}: ${currentLabel}`}
        title={`${t('theme')}: ${currentLabel}`}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xs transition-colors border border-slate-300 dark:border-slate-700"
      >
        {currentIcon}
        <span className="hidden lg:inline">{currentLabel}</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('theme')}
          className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-900 rounded-sm shadow-md border border-slate-300 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-0.5">
            {t('theme')}
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setTheme(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
