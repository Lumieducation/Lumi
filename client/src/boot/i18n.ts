import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .use(HttpApi)
    .init({
        backend: {
            loadPath: '/locales/{{ns}}/{{lng}}.json'
        },
        fallbackLng: 'en',
        load: 'all',
        interpolation: {
            escapeValue: false
        },
        ns: ['lumi'],
        defaultNS: 'lumi',
        detection: {
            order: ['navigator']
        }
    });

export default i18n;
