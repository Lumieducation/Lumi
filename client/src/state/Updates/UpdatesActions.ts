import * as Sentry from '@sentry/browser';

import {
    UPDATES_GET_UPDATES_REQUEST,
    UPDATES_GET_UPDATES_ERROR,
    UPDATES_GET_UPDATES_SUCCESS,
    UPDATES_UPDATE_REQUEST,
    UPDATES_UPDATE_ERROR,
    UPDATES_UPDATE_SUCCESS
} from './UpdatesTypes';

import * as API from '../../services/UpdatesAPI';

export function getUpdates(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: UPDATES_GET_UPDATES_REQUEST
            });

            try {
                const updateInfo = await API.getUpdates();

                dispatch({
                    payload: updateInfo,
                    type: UPDATES_GET_UPDATES_SUCCESS
                });
                return updateInfo;
            } catch (error: any) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: UPDATES_GET_UPDATES_ERROR
                });
            }
        } catch (error: any) {}
    };
}

export function update(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                type: UPDATES_UPDATE_REQUEST
            });

            try {
                await API.update();

                dispatch({
                    type: UPDATES_UPDATE_SUCCESS
                });
            } catch (error: any) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: UPDATES_UPDATE_ERROR
                });
            }
        } catch (error: any) {}
    };
}
