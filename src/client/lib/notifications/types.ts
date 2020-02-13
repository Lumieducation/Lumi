export type NotificationTypes =
    | 'default'
    | 'error'
    | 'success'
    | 'warning'
    | 'info';

export interface INotification {
    dismissed?: boolean;
    key: string;
    message: string;
    options: {
        onClose?: (event: any, reason: any, key: string) => void;
        variant: NotificationTypes;
    };
}

export interface INotificationsState {
    notifications: INotification[];
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
    | IRemoveSnackbar;

export const ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const REMOVE_SNACKBAR = 'REMOVE_SNACKBAR';
