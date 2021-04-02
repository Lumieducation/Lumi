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
    IRunUpdateState,
    RUN_UPDATE_STATE,
    IRunState
} from './RunTypes';

import * as API from './RunAPI';

export function getRuns(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: RUN_GET_RUNS_REQUEST
            });

            try {
                const settings = await API.getRuns();

                dispatch({
                    payload: settings,
                    type: RUN_GET_RUNS_SUCCESS
                });
            } catch (error) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: RUN_GET_RUNS_ERROR
                });
            }
        } catch (error) {
            Sentry.captureException(error);
        }
    };
}

export function upload(options?: { includeReporter?: boolean; path?: string }) {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: RUN_UPLOAD_REQUEST
            });

            try {
                const run = await API.upload();

                dispatch({
                    payload: run,
                    type: RUN_UPLOAD_SUCCESS
                });
            } catch (error) {
                Sentry.captureException(error);

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

export function deleteFromRun(id: string, secret: string): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: RUN_DELETE_REQUEST
            });

            try {
                const run = await API.deleteFromRun(id, secret);

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
