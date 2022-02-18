import * as Sentry from '@sentry/browser';

import {
    SYSTEM_GET_SYSTEM_REQUEST,
    SYSTEM_GET_SYSTEM_ERROR,
    SYSTEM_GET_SYSTEM_SUCCESS
} from './SystemTypes';

import * as API from '../../services/SystemAPI';

export function getSystem(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: SYSTEM_GET_SYSTEM_REQUEST
            });

            try {
                const system = await API.getSystem();

                dispatch({
                    payload: system,
                    type: SYSTEM_GET_SYSTEM_SUCCESS
                });
                return system;
            } catch (error: any) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: SYSTEM_GET_SYSTEM_ERROR
                });
            }
        } catch (error: any) {}
    };
}
