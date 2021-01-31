import {
    ANALYTICS_IMPORT_REQUEST,
    ANALYTICS_IMPORT_SUCCESS,
    ANALYTICS_IMPORT_ERROR
} from './AnalyticsTypes';

import * as API from './AnalyticsAPI';

export function importAnalytics(): any {
    return async (dispatch: any) => {
        dispatch({
            payload: {},
            type: ANALYTICS_IMPORT_REQUEST
        });

        try {
            const { users, interactions } = await API.importAnalytics();

            dispatch({
                payload: { users, interactions },
                type: ANALYTICS_IMPORT_SUCCESS
            });
        } catch (error) {
            try {
                dispatch({
                    payload: { message: error.response.body.message },
                    type: ANALYTICS_IMPORT_ERROR
                });
            } catch (error) {
                dispatch({
                    payload: { message: 'no valid data' },
                    type: ANALYTICS_IMPORT_ERROR
                });
            }
        }
    };
}
