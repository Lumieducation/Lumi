import * as Sentry from '@sentry/browser';

import {
    ANALYTICS_IMPORT_REQUEST,
    ANALYTICS_IMPORT_SUCCESS,
    ANALYTICS_IMPORT_ERROR
} from './AnalyticsTypes';

import { track } from '../track/actions';

import * as API from '../../services/AnalyticsAPI';

export function importAnalytics(): any {
    return async (dispatch: any) => {
        dispatch({
            payload: {},
            type: ANALYTICS_IMPORT_REQUEST
        });

        dispatch(track('Analytics', 'import'));
        try {
            const { files } = await API.importAnalytics();
            dispatch(
                track('Analytics', 'import', `content-types`, files.length)
            );

            dispatch({
                payload: { files },
                type: ANALYTICS_IMPORT_SUCCESS
            });
        } catch (error: any) {
            Sentry.captureException(error);

            dispatch({
                payload: { message: JSON.stringify(error) },
                type: ANALYTICS_IMPORT_ERROR
            });
        }
    };
}
