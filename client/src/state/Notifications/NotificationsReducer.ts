import * as Sentry from '@sentry/browser';
import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    INotificationsState,
    REMOVE_SNACKBAR,
    INotifyAction,
    ICloseSnackbar,
    IRemoveSnackbar,
    SHOW_ERROR_DIALOG,
    IShowErrorDialog,
    ICloseErrorDialog,
    CLOSE_ERROR_DIALOG
} from './NotificationsTypes';

import {
    H5PEDITOR_SAVE_SUCCESS,
    H5PEDITOR_SAVE_ERROR,
    H5P_OPEN_ERROR,
    H5PEDITOR_EXPORT_SUCCESS,
    H5PEDITOR_EXPORT_ERROR,
    H5PEDITOR_ERROR,
    IH5PEditorSaveSuccessAction,
    IH5PEditorSaveErrorAction,
    IH5PEditorExportErrorAction,
    IH5PEditorExportSuccessAction,
    IH5PEditorError,
    IH5POpenErrorAction
} from '../H5PEditor/H5PEditorTypes';

import {
    ANALYTICS_IMPORT_SUCCESS,
    ANALYTICS_IMPORT_ERROR,
    IAnalyticsImportSuccessAction,
    IAnalyticsImportErrorAction
} from '../Analytics/AnalyticsTypes';

import i18next from 'i18next';

import { nanoid } from 'nanoid';

export const initialState: INotificationsState = {
    notifications: [],
    showErrorDialog: false,
    error: {
        code: 'init',
        message: ''
    }
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
        | IH5POpenErrorAction
        | IAnalyticsImportSuccessAction
        | IAnalyticsImportErrorAction
        | IShowErrorDialog
        | ICloseErrorDialog
): INotificationsState {
    try {
        switch (action.type) {
            case SHOW_ERROR_DIALOG:
                return {
                    ...state,
                    showErrorDialog: true,
                    error: action.payload.error
                };

            case CLOSE_ERROR_DIALOG:
                return {
                    ...state,
                    error: {
                        code: 'init',
                        message: '',
                        redirect: undefined
                    },
                    showErrorDialog: false
                };

            case ANALYTICS_IMPORT_ERROR:
                return {
                    ...state,
                    notifications: [
                        ...state.notifications,
                        {
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.analytics.import.error'
                            ),
                            options: {
                                variant: 'error'
                            }
                        }
                    ]
                };

            case ANALYTICS_IMPORT_SUCCESS:
                return {
                    ...state,
                    notifications: [
                        ...state.notifications,
                        {
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.analytics.import.success'
                            ),
                            options: {
                                variant: 'success'
                            }
                        }
                    ]
                };

            case H5PEDITOR_ERROR:
                return {
                    ...state,
                    notifications: [
                        ...state.notifications,
                        {
                            key: nanoid(),
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
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.h5peditor.save.success'
                            ),
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
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.h5peditor.save.error'
                            ),
                            options: {
                                variant: 'error'
                            }
                        }
                    ]
                };

            case H5P_OPEN_ERROR:
                return {
                    ...state,
                    notifications: [
                        ...state.notifications,
                        {
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.h5peditor.open.error'
                            ),
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
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.h5peditor.export_as_html.success'
                            ),
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
                            key: nanoid(),
                            message: i18next.t(
                                'notifications.h5peditor.export_as_html.error'
                            ),
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
                    notifications: state.notifications.map(
                        (notification: any) =>
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
    } catch (error: any) {
        Sentry.captureException(error);
        return state;
    }
}
