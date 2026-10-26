import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hy from './hy.json';

export const DEFAULT_LOCALE = 'hy' as const;
export type AppLocale = typeof DEFAULT_LOCALE;

void i18n.use(initReactI18next).init({
  resources: {
    hy: { translation: hy },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  debug: import.meta.env.DEV,
});

export { i18n };
export default i18n;
