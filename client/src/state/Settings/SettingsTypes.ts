export interface IState {
    settings: ISettingsState;
}

export interface ISettingsState {
    bugTracking: boolean;
    firstOpen: boolean;
    lastVersion: string;
    privacyPolicyConsent: boolean;
    usageStatistics: boolean;
    autoUpdates: boolean;
    language: string;
    email: string;
    token: string;
    allowPrerelease: boolean;
    enableLumiRun: boolean;
}

export const SETTINGS_GET_SETTINGS_REQUEST = 'SETTINGS_GET_SETTINGS_REQUEST';
export const SETTINGS_GET_SETTINGS_SUCCESS = 'SETTINGS_GET_SETTINGS_SUCCESS';
export const SETTINGS_GET_SETTINGS_ERROR = 'SETTINGS_GET_SETTINGS_ERROR';

export const SETTINGS_UPDATE_REQUEST = 'SETTINGS_UPDATE_REQUEST';
export const SETTINGS_UPDATE_SUCCESS = 'SETTINGS_UPDATE_SUCCESS';
export const SETTINGS_UPDATE_ERROR = 'SETTINGS_UPDATE_ERROR';

export const SETTINGS_CHANGE = 'SETTINGS_CHANGE';

export interface IChangeSettingsAction {
    payload: Partial<ISettingsState>;
    type: typeof SETTINGS_CHANGE;
}

export interface IGetSettingsRequestAction {
    payload: {};
    type: typeof SETTINGS_GET_SETTINGS_REQUEST;
}

export interface IGetSettingsSuccessAction {
    payload: ISettingsState;
    type: typeof SETTINGS_GET_SETTINGS_SUCCESS;
}
export interface IGetSettingsErrorAction {
    payload: {
        error: string;
    };
    type: typeof SETTINGS_GET_SETTINGS_ERROR;
}

export interface IUpdateSettingsRequestAction {
    payload: {
        update: Partial<ISettingsState>;
    };
    type: typeof SETTINGS_UPDATE_REQUEST;
}

export interface IUpdateSettingsSuccessAction {
    payload: ISettingsState;

    type: typeof SETTINGS_UPDATE_SUCCESS;
}

export interface IUpdateSettingsErrorAction {
    payload: {
        error: string;
    };
    type: typeof SETTINGS_UPDATE_ERROR;
}

export type ISettingsActionTypes =
    | IGetSettingsErrorAction
    | IGetSettingsRequestAction
    | IGetSettingsSuccessAction
    | IUpdateSettingsErrorAction
    | IUpdateSettingsRequestAction
    | IUpdateSettingsSuccessAction
    | IChangeSettingsAction;
