import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    NotificationActionTypes,
    NotificationTypes,
    REMOVE_SNACKBAR
} from './NotificationsTypes';

import shortid from 'shortid';

export function notify(
    message: string,
    variant: NotificationTypes
): NotificationActionTypes {
    return {
        notification: {
            key: shortid(),
            message,
            options: {
                variant
            }
        },
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
