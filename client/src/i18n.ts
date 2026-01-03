import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationPT from './locales/pt-BR/translation.json';
import translationEN from './locales/en/translation.json';

i18next.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: translationPT },
    en: { translation: translationEN }
  },
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false }
});

export default i18next;
