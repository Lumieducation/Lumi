import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    IShowErrorDialog,
    NotificationActionTypes,
    NotificationTypes,
    REMOVE_SNACKBAR,
    SHOW_ERROR_DIALOG,
    ErrorTypes,
    ICloseErrorDialog,
    CLOSE_ERROR_DIALOG
} from './NotificationsTypes';

import { nanoid } from 'nanoid';

export function notify(
    message: string,
    variant: NotificationTypes
): NotificationActionTypes {
    return {
        notification: {
            key: nanoid(),
            message,
            options: {
                variant
            }
        },
        type: ENQUEUE_SNACKBAR
    };
}

export function showErrorDialog(
    code: ErrorTypes,
    message: string,
    redirect?: string
): IShowErrorDialog {
    return {
        payload: {
            error: {
                code,
                message,
                redirect
            }
        },
        type: SHOW_ERROR_DIALOG
    };
}

export function closeErrorDialog(): ICloseErrorDialog {
    return {
        payload: {},
        type: CLOSE_ERROR_DIALOG
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
