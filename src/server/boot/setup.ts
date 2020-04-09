import mkdirp from 'mkdirp';

import appConfig from '../config/app-config';

import * as Sentry from '@sentry/node';

export default function setup(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            mkdirp.sync(appConfig.workingCachePath);
            mkdirp.sync(appConfig.librariesPath);
            mkdirp.sync(appConfig.temporaryStoragePath);
            resolve();
        } catch (error) {
            Sentry.captureException(error);
            reject(error);
        }
    });
}
