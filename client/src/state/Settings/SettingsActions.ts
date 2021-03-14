import * as Sentry from '@sentry/browser';

import store from '../../state';
import {
    SETTINGS_GET_SETTINGS_REQUEST,
    SETTINGS_GET_SETTINGS_ERROR,
    SETTINGS_GET_SETTINGS_SUCCESS,
    SETTINGS_UPDATE_REQUEST,
    SETTINGS_UPDATE_SUCCESS,
    SETTINGS_UPDATE_ERROR,
    SETTINGS_CHANGE,
    ISettingsState
} from './SettingsTypes';

import * as API from './SettingsAPI';

export function getSettings(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: SETTINGS_GET_SETTINGS_REQUEST
            });

            try {
                const settings = await API.getSettings();

                dispatch({
                    payload: settings,
                    type: SETTINGS_GET_SETTINGS_SUCCESS
                });
                return settings;
            } catch (error) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: SETTINGS_GET_SETTINGS_ERROR
                });
            }
        } catch (error) {}
    };
}

export function updateSettings(settings: ISettingsState): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: settings,
                type: SETTINGS_UPDATE_REQUEST
            });

            await API.updateSettings(settings);

            dispatch({
                payload: settings,
                type: SETTINGS_UPDATE_SUCCESS
            });

            if (settings.privacyPolicyConsent) {
                await API.updateContentTypeCache();
            }
        } catch (error) {
            Sentry.captureException(error);

            dispatch({
                payload: { error },
                type: SETTINGS_UPDATE_ERROR
            });
        }
    };
}

export function changeSetting(payload: Partial<ISettingsState>): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload,
                type: SETTINGS_CHANGE
            });

            dispatch(updateSettings(store.getState().settings));
        } catch (error) {
            Sentry.captureException(error);
        }
    };
}
