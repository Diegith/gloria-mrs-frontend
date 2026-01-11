import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend'; // <--- Importado correctamente
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // <--- ¡FALTABA ESTA LÍNEA! Registra el motor de carga HTTP
  .use(LanguageDetector) 
  .use(initReactI18next) 
  .init({
    fallbackLng: 'es', 
    load: 'languageOnly',
    //debug: true, // pruebas en Vercel
    
    ns: ['layout', 'scenario', 'user'], 
    defaultNS: 'layout', 
    
    interpolation: {
      escapeValue: false, 
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;