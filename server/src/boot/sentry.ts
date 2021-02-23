import * as Sentry from '@sentry/electron';
import { app } from 'electron';
import fsExtra from 'fs-extra';
import IServerConfig from '../IServerConfig';

export default async function boot(serverConfig: IServerConfig): void {
    if (process.env.NODE_ENV !== 'development') {
        if (await fsExtra.pathExists(serverConfig.settingsFile)) {
            const settings = await fsExtra.readJSON(serverConfig.settingsFile);

            if (settings.bugTracking) {
                Sentry.init({
                    dsn:
                        'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
                    release: app.getVersion(),
                    environment: process.env.NODE_ENV
                });
            }
        }
    }
}
