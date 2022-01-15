import * as Sentry from '@sentry/browser';
import i18next from 'i18next';

import {
    RUN_GET_RUNS_REQUEST,
    RUN_GET_RUNS_SUCCESS,
    RUN_GET_RUNS_ERROR,
    RUN_UPLOAD_REQUEST,
    RUN_UPLOAD_SUCCESS,
    RUN_UPLOAD_ERROR,
    RUN_DELETE_REQUEST,
    RUN_DELETE_SUCCESS,
    RUN_DELETE_ERROR,
    RUN_NOT_AUTHORIZED,
    IRunUpdateState,
    RUN_UPDATE_STATE,
    IRunState
} from './RunTypes';

import store from '../../state';

import { updateContentOnServer } from '../H5PEditor/H5PEditorActions';
import { notify, showErrorDialog } from '../Notifications/NotificationsActions';

import * as API from '../../services/RunAPI';

export function getRuns(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: RUN_GET_RUNS_REQUEST
            });

            try {
                const runResponse = await API.getRuns();

                return dispatch({
                    payload: runResponse,
                    type: RUN_GET_RUNS_SUCCESS
                });
            } catch (error: any) {
                if (error.status === 401) {
                    return dispatch({
                        payload: {},
                        type: RUN_NOT_AUTHORIZED
                    });
                }

                Sentry.captureException(error);
                return dispatch({
                    payload: { error },
                    type: RUN_GET_RUNS_ERROR
                });
            }
        } catch (error: any) {
            Sentry.captureException(error);
        }
    };
}

export function upload(options?: { path?: string; contentId?: string }) {
    return async (dispatch: any) => {
        try {
            const settings = store.getState().settings;
            if (!settings.email || !settings.token) {
                return dispatch(updateState({ showSetupDialog: true }));
            }

            dispatch(updateState({ showUploadDialog: true }));
            let contentId = options?.contentId;

            if (!options?.path && contentId) {
                const data = await dispatch(updateContentOnServer());
                contentId = data.contentId;
            }

            dispatch({
                payload: {},
                type: RUN_UPLOAD_REQUEST
            });

            try {
                const run = await API.upload(contentId);

                dispatch({
                    payload: run,
                    type: RUN_UPLOAD_SUCCESS
                });
                dispatch(
                    notify(
                        i18next.t('run.notifications.upload.success'),
                        'success'
                    )
                );
                dispatch(getRuns());
            } catch (error: any) {
                if (error.status !== 499) {
                    Sentry.captureException(error);

                    dispatch(
                        showErrorDialog(
                            error.code || 'errors.codes.econnrefused',
                            'run.dialog.error.description'
                        )
                    );

                    dispatch({
                        payload: { error },
                        type: RUN_UPLOAD_ERROR
                    });
                }

                // user canceled electrons openfile dialog
                dispatch(updateState({ showUploadDialog: false }));
            }
        } catch (error: any) {
            Sentry.captureException(error);
        }
    };
}

export function deleteFromRun(id: string): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: RUN_DELETE_REQUEST
            });

            try {
                const run = await API.deleteFromRun(id);

                dispatch({
                    payload: run,
                    type: RUN_DELETE_SUCCESS
                });
                dispatch(getRuns());
                dispatch(
                    notify(
                        i18next.t('run.notifications.delete.success', { id }),
                        'success'
                    )
                );
            } catch (error: any) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: RUN_DELETE_ERROR
                });
            }
        } catch (error: any) {
            Sentry.captureException(error);
        }
    };
}

export function updateState(payload: Partial<IRunState>): IRunUpdateState {
    return {
        payload,
        type: RUN_UPDATE_STATE
    };
}
