import i18next, { TFunction } from 'i18next';
import fsExtra from 'fs-extra';
import IServerConfig from '../IServerConfig';
import i18nextBackend from 'i18next-node-fs-backend';

export default async function boot(
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
            'metadata-semantics',
            'server',
            'storage-file-implementations',
            'lumi'
        ],
        load: 'languageOnly',
        defaultNS: 'server',
        backend: {
            loadPath: `${__dirname}/../../../locales/{{ns}}/{{lng}}.json`
        }
    });

    return t;
}
