import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    INotificationsState,
    NotificationActionTypes,
    REMOVE_SNACKBAR
} from './types';

export const initialState: INotificationsState = {
    notifications: []
};

export default function notificationsReducer(
    state: INotificationsState = initialState,
    action: NotificationActionTypes
): INotificationsState {
    switch (action.type) {
        case ENQUEUE_SNACKBAR:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        ...action.notification
                    }
                ]
            };

        case CLOSE_SNACKBAR:
            return {
                ...state,
                notifications: state.notifications.map((notification: any) =>
                    action.dismissAll || notification.key === action.key
                        ? { ...notification, dismissed: true }
                        : { ...notification }
                )
            };

        case REMOVE_SNACKBAR:
            return {
                ...state,
                notifications: state.notifications.filter(
                    (notification: any) => notification.key !== action.key
                )
            };

        default:
            return state;
    }
}
