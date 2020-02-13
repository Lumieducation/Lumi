import mkdirp from 'mkdirp';

import config from '../config/config';

import * as Sentry from '@sentry/node';

export default function setup(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            mkdirp.sync(config.workingCachePath);
            mkdirp.sync(config.librariesPath);
            mkdirp.sync(config.temporaryStoragePath);
            resolve();
        } catch (error) {
            Sentry.captureException(error);
            reject(error);
        }
    });
}
