import Logger from '../../helpers/Logger';
import * as Sentry from '@sentry/browser';

import { INotification } from './NotificationsTypes';

const log = new Logger('selectors:notifications');

export function notifications(state: any): INotification[] {
    try {
        log.debug(`selecting notifications`);
        return state.notifications.notifications || [];
    } catch (error: any) {
        Sentry.captureException(error);

        log.error(error);
        return [];
    }
}
