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
    H5PEDITOR_SAVE_SUCCESS,
    H5PEDITOR_SAVE_ERROR,
    H5PEDITOR_EXPORT_SUCCESS,
    H5PEDITOR_EXPORT_ERROR,
    H5PEDITOR_ERROR,
    IH5PEditorSaveSuccessAction,
    IH5PEditorSaveErrorAction,
    IH5PEditorExportErrorAction,
    IH5PEditorExportSuccessAction,
    IH5PEditorError
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
        | IH5PEditorSaveSuccessAction
        | IH5PEditorSaveErrorAction
        | IH5PEditorExportErrorAction
        | IH5PEditorExportSuccessAction
        | IH5PEditorError
): INotificationsState {
    switch (action.type) {
        case H5PEDITOR_ERROR:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        key: shortid(),
                        message: action.payload.message,
                        options: {
                            variant: 'warning'
                        }
                    }
                ]
            };

        case H5PEDITOR_SAVE_SUCCESS:
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

        case H5PEDITOR_SAVE_ERROR:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        key: shortid(),
                        message: 'notification.export.error',
                        options: {
                            variant: 'error'
                        }
                    }
                ]
            };

        case H5PEDITOR_EXPORT_SUCCESS:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        key: shortid(),
                        message: 'notification.exporthtml.success',
                        options: {
                            variant: 'success'
                        }
                    }
                ]
            };

        case H5PEDITOR_EXPORT_ERROR:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        key: shortid(),
                        message: 'notification.exporthtml.error',
                        options: {
                            variant: 'error'
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
