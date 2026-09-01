import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslations from './locales/en.json'
import elTranslations from './locales/el.json'
import { normalizeLang } from '../utils/localizedContent'

const applyDocumentLang = (lng) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = normalizeLang(lng)
}

const storedLng = typeof localStorage !== 'undefined' ? localStorage.getItem('i18nextLng') : null

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      el: { translation: elTranslations },
    },
    fallbackLng: 'en',
    lng: normalizeLang(storedLng || 'en'),
    supportedLngs: ['en', 'el'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => normalizeLang(lng),
    },
  })

applyDocumentLang(i18n.language)
i18n.on('languageChanged', applyDocumentLang)

export default i18n
