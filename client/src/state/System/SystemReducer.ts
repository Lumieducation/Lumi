import * as Sentry from '@sentry/browser';

import {
    ISystemActionTypes,
    ISystemState,
    SYSTEM_GET_SYSTEM_SUCCESS
} from './SystemTypes';

export const initialState: ISystemState = {
    platformSupportsUpdates: true,
    platform: 'mac'
};

export default function settingsReducer(
    state: ISystemState = initialState,
    action: ISystemActionTypes
): ISystemState {
    try {
        switch (action.type) {
            case SYSTEM_GET_SYSTEM_SUCCESS:
                return action.payload;

            default:
                return state;
        }
    } catch (error: any) {
        Sentry.captureException(error);
        return state;
    }
}
