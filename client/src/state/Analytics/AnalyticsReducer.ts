import Logger from '../../helpers/Logger';
import * as Sentry from '@sentry/browser';

import {
    IAnalyticsState,
    AnalyticsActionTypes,
    ANALYTICS_IMPORT_SUCCESS
} from './AnalyticsTypes';

export const initialState: IAnalyticsState = {
    users: [],
    interactions: []
};

const log = new Logger('reducer:analytics');

export default function analyticsReducer(
    state: IAnalyticsState = initialState,
    action: AnalyticsActionTypes
): IAnalyticsState {
    try {
        log.debug(`reducing ${action.type}`);
        switch (action.type) {
            case ANALYTICS_IMPORT_SUCCESS:
                return {
                    users: action.payload.users,
                    interactions: action.payload.interactions
                };

            default:
                return state;
        }
    } catch (error) {
        Sentry.captureException(error);

        log.error(error);
        return state;
    }
}
