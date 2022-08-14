import * as Sentry from '@sentry/electron';
import electron from 'electron';

import SettingsCache from '../config/SettingsCache';
import Logger from '../helpers/Logger';
import { getPlatformInformation } from '../services/platformInformation';

const log = new Logger('bugTracking');

const initSentry = (settingsCache: SettingsCache): void => {
    Sentry.init({
        dsn: 'https://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
        release: electron.app.getVersion(),
        environment: process.env.NODE_ENV,
        beforeSend: async (event: Sentry.Event) => {
            if ((await settingsCache.getSettings()).bugTracking) {
                return event;
            }
            return null;
        }
    });
    Sentry.setTag('type', 'server');
    Sentry.setTag(
        'package_type',
        getPlatformInformation()?.package ?? 'unknown'
    );
};

export const initBugTracking = (settingsCache: SettingsCache): void => {
    const settings = settingsCache.getSettingsSync();
    if (process.env.NODE_ENV !== 'development' && settings.bugTracking) {
        log.info('Initializing Sentry...');
        initSentry(settingsCache);
    } else {
        log.info(
            'Not initializing Sentry (',
            process.env.NODE_ENV === 'development' ? 'in dev mode ' : '',
            !settings.bugTracking ? 'bug tracking disabled in settings' : '',
            ').'
        );
    }
};
