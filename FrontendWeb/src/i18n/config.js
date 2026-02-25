import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';
import pularTranslations from './locales/pular.json';
import soussouTranslations from './locales/soussou.json';
import malinkeTranslations from './locales/malinke_fixed.json';

const resources = {
    fr: { translation: frTranslations },
    en: { translation: enTranslations },
    pular: { translation: pularTranslations },
    soussou: { translation: soussouTranslations },
    malinke: { translation: malinkeTranslations }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
