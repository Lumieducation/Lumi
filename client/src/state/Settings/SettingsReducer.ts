import * as Sentry from '@sentry/browser';

import {
    ISettingsActionTypes,
    ISettingsState,
    SETTINGS_GET_SETTINGS_SUCCESS,
    SETTINGS_CHANGE,
    SETTINGS_UPDATE_SUCCESS
} from './SettingsTypes';

export const initialState: ISettingsState = {
    firstOpen: false,
    lastVersion: '',
    bugTracking: false,
    usageStatistics: false,
    privacyPolicyConsent: false,
    autoUpdates: false,
    language: 'en',
    email: '',
    token: '',
    allowPrerelease: false,
    enableLumiRun: false
};

export default function settingsReducer(
    state: ISettingsState = initialState,
    action: ISettingsActionTypes
): ISettingsState {
    try {
        switch (action.type) {
            case SETTINGS_GET_SETTINGS_SUCCESS:
                return action.payload;

            case SETTINGS_CHANGE:
                return {
                    ...state,
                    ...action.payload
                };

            case SETTINGS_UPDATE_SUCCESS:
                return action.payload;

            default:
                return state;
        }
    } catch (error: any) {
        Sentry.captureException(error);
        return state;
    }
}
