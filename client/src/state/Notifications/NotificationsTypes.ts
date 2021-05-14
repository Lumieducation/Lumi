export type NotificationTypes =
    | 'default'
    | 'error'
    | 'success'
    | 'warning'
    | 'info';

export const ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const REMOVE_SNACKBAR = 'REMOVE_SNACKBAR';

export const SHOW_ERROR_DIALOG = 'SHOW_ERROR_DIALOG';
export const CLOSE_ERROR_DIALOG = 'CLOSE_ERROR_DIALOG';

export type ErrorTypes = 'init' | 'econnrefused' | 'errors.codes.econnrefused';

export interface INotification {
    dismissed?: boolean;
    key: string;
    message: string;
    options: {
        onClose?: (event: any, reason: any, key: string) => void;
        variant: NotificationTypes;
    };
}

export interface IState {
    notifications: INotificationsState;
}

export interface INotificationsState {
    notifications: INotification[];
    showErrorDialog: boolean;
    error: {
        code: ErrorTypes;
        message: string;
        redirect?: string;
    };
}

export interface IShowErrorDialog {
    payload: {
        error: {
            code: ErrorTypes;
            message: string;
            redirect?: string;
        };
    };
    type: typeof SHOW_ERROR_DIALOG;
}

export interface ICloseErrorDialog {
    payload: {};
    type: typeof CLOSE_ERROR_DIALOG;
}

export interface INotifyAction {
    notification: INotification;
    type: typeof ENQUEUE_SNACKBAR;
}

export interface ICloseSnackbar {
    dismissAll: boolean;
    key: string;
    type: typeof CLOSE_SNACKBAR;
}

export interface IRemoveSnackbar {
    key: string;
    type: typeof REMOVE_SNACKBAR;
}

export type NotificationActionTypes =
    | INotifyAction
    | ICloseSnackbar
    | IRemoveSnackbar
    | IShowErrorDialog;
