import mkdirp from 'mkdirp';
import * as Sentry from '@sentry/node';

import IServerConfig from '../../config/IServerConfig';

export default async function setup(
    serverConfig: IServerConfig
): Promise<void> {
    try {
        mkdirp.sync(serverConfig.workingCachePath);
        mkdirp.sync(serverConfig.librariesPath);
        mkdirp.sync(serverConfig.temporaryStoragePath);
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
