import i18next, { TFunction } from 'i18next';
import i18nextBackend from 'i18next-node-fs-backend';
import SettingsStorage from '../config/SettingsCache';

export const supportedLocales = [
    { code: 'af', name: 'Afrikaans' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'ar', name: 'العربية' },
    { code: 'bg', name: 'български език' },
    { code: 'bs', name: 'bosanski jezik' },
    { code: 'ca', name: 'català, valencià' },
    { code: 'cs', name: 'čeština, český jazyk' },
    { code: 'de', name: 'Deutsch' },
    { code: 'el', name: 'ελληνικά' },
    { code: 'en', name: 'English' },
    { code: 'es-mx', name: 'español mexicano' },
    { code: 'es', name: 'español' },
    { code: 'et', name: 'eesti, eesti keel' },
    { code: 'eu', name: 'euskara, euskera' },
    { code: 'fi', name: 'suomi, suomen kieli' },
    { code: 'fr', name: 'français' },
    { code: 'it', name: 'Italiano' },
    { code: 'km', name: 'ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ' },
    { code: 'ko', name: '한국어' },
    { code: 'nb', name: 'Norsk Bokmål' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'nn', name: 'Norsk Nynorsk' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'русский' },
    { code: 'sl', name: 'slovenski jezik' },
    { code: 'sv', name: 'Svenska' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'zh', name: '中文 (Zhōngwén), 汉语, 漢語' },
    { code: 'ja', name: '日本語 (にほんご)' }
];

export default async function initI18n(
    settingsCache: SettingsStorage
): Promise<TFunction> {
    const languageCode = (await settingsCache.getSettings()).language;

    const t = await i18next.use(i18nextBackend).init({
        lng: languageCode,
        fallbackLng: 'en',
        ns: [
            'client',
            'copyright-semantics',
            'hub',
            'library-metadata',
            'lumi',
            'metadata-semantics',
            'server',
            'storage-file-implementations'
        ],
        load: 'all',
        defaultNS: 'server',
        backend: {
            loadPath: `${__dirname}/../../../locales/{{ns}}/{{lng}}.json`
        }
    });

    return t;
}
