import * as Sentry from '@sentry/browser';

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

import * as API from './RunAPI';

export function getRuns(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: RUN_GET_RUNS_REQUEST
            });

            try {
                const runs = await API.getRuns();

                return dispatch({
                    payload: runs,
                    type: RUN_GET_RUNS_SUCCESS
                });
            } catch (error) {
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
        } catch (error) {
            Sentry.captureException(error);
        }
    };
}

export function upload(options?: {
    includeReporter?: boolean;
    path?: string;
    contentId?: string;
    title?: string;
    mainLibrary?: string;
}) {
    return async (dispatch: any) => {
        try {
            const settings = store.getState().settings;
            if (!settings.email || !settings.token) {
                return dispatch(updateState({ showSetupDialog: true }));
            }

            dispatch({
                payload: {},
                type: RUN_UPLOAD_REQUEST
            });

            dispatch(updateState({ showUploadDialog: true }));

            try {
                const run = await API.upload(
                    options?.contentId,
                    options?.title,
                    options?.mainLibrary
                );

                dispatch({
                    payload: run,
                    type: RUN_UPLOAD_SUCCESS
                });
                dispatch(getRuns());
            } catch (error) {
                Sentry.captureException(error);

                dispatch(updateState({ showUploadDialog: false }));

                dispatch({
                    payload: { error },
                    type: RUN_UPLOAD_ERROR
                });
            }
        } catch (error) {
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
            } catch (error) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: RUN_DELETE_ERROR
                });
            }
        } catch (error) {
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
