import Logger from '../../helpers/Logger';

import { INotification } from './types';

const log = new Logger('selectors:notifications');

export function notifications(state: any): INotification[] {
    try {
        log.debug(`selecting notifications`);
        return state.notifications.notifications || [];
    } catch (error) {
        log.error(error);
        return [];
    }
}
