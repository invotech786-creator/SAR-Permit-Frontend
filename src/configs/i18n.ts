import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const isServer = typeof window === 'undefined'

if (isServer) {
  i18n
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      debug: true,
      keySeparator: false,
      react: {
        useSuspense: false
      },
      interpolation: {
        escapeValue: false,
        formatSeparator: ','
      },
      resources: {
        en: {
          translation: require('../../public/locales/en.json')
        },
        ar: {
          translation: require('../../public/locales/ar.json')
        }
      }
    })
} else {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: {
        loadPath: '/locales/{{lng}}.json'
      },
      fallbackLng: 'en',
      debug: false,
      keySeparator: false,
      react: {
        useSuspense: false
      },
      interpolation: {
        escapeValue: false,
        formatSeparator: ','
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      }
    })
}

export default i18n
