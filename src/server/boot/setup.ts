import mkdirp from 'mkdirp';
import * as Sentry from '@sentry/node';

import appConfig from '../config/app-config';

export default async function setup(): Promise<void> {
    try {
        mkdirp.sync(appConfig.workingCachePath);
        mkdirp.sync(appConfig.librariesPath);
        mkdirp.sync(appConfig.temporaryStoragePath);
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
