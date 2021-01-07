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
    H5P_EXPORT_ERROR,
    H5PEDITOR_EXPORTHTML_SUCCESS,
    H5PEDITOR_EXPORTHTML_ERROR,
    IH5PExportSuccessAction,
    IH5PExportErrorAction,
    IH5PEditorExportHtmlErrorAction,
    IH5PEditorExportHtmlSuccessAction
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
        | IH5PExportErrorAction
        | IH5PEditorExportHtmlErrorAction
        | IH5PEditorExportHtmlSuccessAction
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

        case H5P_EXPORT_ERROR:
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

        case H5PEDITOR_EXPORTHTML_SUCCESS:
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

        case H5PEDITOR_EXPORTHTML_ERROR:
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
