import i18next, { TFunction } from 'i18next';
import i18nextBackend from 'i18next-node-fs-backend';
import SettingsStorage from '../config/SettingsCache';

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
        load: 'languageOnly',
        defaultNS: 'server',
        backend: {
            loadPath: `${__dirname}/../../../locales/{{ns}}/{{lng}}.json`
        }
    });

    return t;
}
