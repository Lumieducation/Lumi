import * as Sentry from '@sentry/browser';

import {
    ANALYTICS_IMPORT_REQUEST,
    ANALYTICS_IMPORT_SUCCESS,
    ANALYTICS_IMPORT_ERROR
} from './AnalyticsTypes';

import { track } from '../track/actions';

import * as API from './AnalyticsAPI';

export function importAnalytics(): any {
    return async (dispatch: any) => {
        dispatch({
            payload: {},
            type: ANALYTICS_IMPORT_REQUEST
        });

        dispatch(track('Analytics', 'import'));
        try {
            const { users, interactions } = await API.importAnalytics();
            dispatch(
                track(
                    'Analytics',
                    'import',
                    `content-types`,
                    interactions.length
                )
            );

            dispatch({
                payload: { users, interactions },
                type: ANALYTICS_IMPORT_SUCCESS
            });
        } catch (error) {
            Sentry.captureException(error);
            try {
                dispatch({
                    payload: { message: error.response.body.message },
                    type: ANALYTICS_IMPORT_ERROR
                });
            } catch (error) {
                Sentry.captureException(error);

                dispatch({
                    payload: { message: 'no valid data' },
                    type: ANALYTICS_IMPORT_ERROR
                });
            }
        }
    };
}
