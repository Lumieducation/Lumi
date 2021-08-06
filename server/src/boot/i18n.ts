import i18next, { TFunction } from 'i18next';
import fsExtra from 'fs-extra';
import IServerConfig from '../config/IPaths';
import i18nextBackend from 'i18next-node-fs-backend';

export default async function initI18n(
    serverConfig: IServerConfig
): Promise<TFunction> {
    const languageCode = (await fsExtra.readJSON(serverConfig.settingsFile))
        .language;

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
