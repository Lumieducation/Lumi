import mkdirp from 'mkdirp';
import * as Sentry from '@sentry/node';

import serverConfig from '../../config/serverConfig';

export default async function setup(): Promise<void> {
    try {
        mkdirp.sync(serverConfig.workingCachePath);
        mkdirp.sync(serverConfig.librariesPath);
        mkdirp.sync(serverConfig.temporaryStoragePath);
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
