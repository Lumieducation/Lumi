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

import * as settingsAPI from '../../services/SettingsAPI';
import { updateContentTypeCache } from '../../services/H5PApi';

export function getSettings(): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: {},
                type: SETTINGS_GET_SETTINGS_REQUEST
            });

            try {
                const settings = await settingsAPI.getSettings();

                dispatch({
                    payload: settings,
                    type: SETTINGS_GET_SETTINGS_SUCCESS
                });
                return settings;
            } catch (error: any) {
                Sentry.captureException(error);

                dispatch({
                    payload: { error },
                    type: SETTINGS_GET_SETTINGS_ERROR
                });
            }
        } catch (error: any) {}
    };
}

export function updateSettings(settings: ISettingsState): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload: settings,
                type: SETTINGS_UPDATE_REQUEST
            });

            await settingsAPI.updateSettings(settings);

            dispatch({
                payload: settings,
                type: SETTINGS_UPDATE_SUCCESS
            });

            if (settings.privacyPolicyConsent) {
                await updateContentTypeCache();
            }
        } catch (error: any) {
            Sentry.captureException(error);

            dispatch({
                payload: { error },
                type: SETTINGS_UPDATE_ERROR
            });
        }
    };
}

/**
 *
 * @param payload
 * @param save If true, the setting change will also be persisted, if false the
 * change will only be performed in the Redux state, but not persisted to the
 * disk.
 * @returns
 */
export function changeSetting(
    payload: Partial<ISettingsState>,
    save: boolean = true
): any {
    return async (dispatch: any) => {
        try {
            dispatch({
                payload,
                type: SETTINGS_CHANGE
            });

            if (save) {
                dispatch(updateSettings(store.getState().settings));
            }
        } catch (error: any) {
            Sentry.captureException(error);
        }
    };
}
