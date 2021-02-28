import * as Sentry from '@sentry/browser';

import {
    RUN_GET_RUNS_REQUEST,
    RUN_GET_RUNS_SUCCESS,
    RUN_GET_RUNS_ERROR,
    RUN_UPLOAD_REQUEST,
    RUN_UPLOAD_SUCCESS,
    RUN_UPLOAD_ERROR
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
