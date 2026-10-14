import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Language, type TranslationKey } from '@/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'fixkh_language'

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const qLang = new URLSearchParams(window.location.search).get('lang')
      if (qLang === 'km' || qLang === 'en') return qLang
    } catch {}
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'km' ? 'km' : 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'km' : 'en'))
  }

  const t = (key: TranslationKey): string => {
    const langDict = translations[language]
    if (langDict && key in langDict) {
      return langDict[key]
    }
    return translations.en[key] || String(key)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
