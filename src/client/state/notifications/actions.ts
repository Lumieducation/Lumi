import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    NotificationActionTypes,
    NotificationTypes,
    REMOVE_SNACKBAR
} from './types';

import shortid from 'shortid';

import Notification from './model';

export function notify(
    message: string,
    variant: NotificationTypes
): NotificationActionTypes {
    const notification = new Notification(shortid(), message, variant);
    return {
        notification,
        type: ENQUEUE_SNACKBAR
    };
}

export function closeSnackbar(key: string): NotificationActionTypes {
    return {
        key,
        // tslint:disable-next-line: object-literal-sort-keys
        dismissAll: !key,
        type: CLOSE_SNACKBAR
    };
}

export function removeSnackbar(key: string): NotificationActionTypes {
    return {
        key,
        type: REMOVE_SNACKBAR
    };
}
