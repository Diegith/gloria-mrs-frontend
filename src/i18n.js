import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Carga archivos JSON vía HTTP (desde /public)
  .use(LanguageDetector) // Detecta el idioma del navegador automáticamente
  .use(initReactI18next) // Integra i18n con React
  .init({
    fallbackLng: 'es', // Idioma por defecto si falla la detección
    debug: false,
    
    // Namespaces definidos en tus archivos JSON
    ns: ['layout', 'scenario', 'user'], 
    defaultNS: 'layout', 
    
    interpolation: {
      escapeValue: false, // React ya protege contra XSS
    },

    backend: {
      // Ruta donde creamos las carpetas anteriormente
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;