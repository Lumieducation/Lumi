import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    INotificationsState,
    REMOVE_SNACKBAR,
    INotifyAction,
    ICloseSnackbar,
    IRemoveSnackbar
} from './NotificationsTypes';

import {
    H5P_EXPORT_SUCCESS,
    IH5PExportSuccessAction
} from '../H5PEditor/H5PEditorTypes';
import shortid from 'shortid';

export const initialState: INotificationsState = {
    notifications: []
};

export default function notificationsReducer(
    state: INotificationsState = initialState,
    action:
        | INotifyAction
        | ICloseSnackbar
        | IRemoveSnackbar
        | IH5PExportSuccessAction
): INotificationsState {
    switch (action.type) {
        case H5P_EXPORT_SUCCESS:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        key: shortid(),
                        message: 'notification.export.success',
                        options: {
                            variant: 'success'
                        }
                    }
                ]
            };

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
