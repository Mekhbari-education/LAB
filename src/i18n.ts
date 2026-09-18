import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from './locales/ar/translation.json';
import fr from './locales/fr/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      fr: { translation: fr },
      en: { translation: en }
    },
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'fr', 'en'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

// Update document direction on language change
i18n.on('languageChanged', (lng) => {
  const isArabic = lng === 'ar' || lng?.startsWith('ar');
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;

// Set initial direction
const initialIsArabic = i18n.language === 'ar' || i18n.language?.startsWith('ar');
document.documentElement.dir = initialIsArabic ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;
