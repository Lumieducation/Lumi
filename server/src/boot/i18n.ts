import i18next, { TFunction } from 'i18next';
import fsExtra from 'fs-extra';
import IServerConfig from '../IServerConfig';
import i18nextBackend from 'i18next-node-fs-backend';

export default async function boot(
    serverConfig: IServerConfig
): Promise<TFunction> {
    const languageCode = (await fsExtra.readJSON(serverConfig.settingsFile))
        .language;
    let locales;
    try {
        locales = await fsExtra.readJSON(
            `${__dirname}/../../../locales/${languageCode}.json`
        );
    } catch (error) {
        locales = await fsExtra.readJSON(
            `${__dirname}/../../../locales/en.json`
        );
    }

    const t = await i18next.use(i18nextBackend).init({
        lng: languageCode,
        fallbackLng: 'en',
        backend: {
            loadPath: `${__dirname}/../../../locales/{{lng}}.json`
        }
    });

    return t;
}
