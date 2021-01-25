import { IInteraction, IUser } from '@lumieducation/xapi-viewer';

// state

export interface IAnalyticsState {
    users: IUser[];
    interactions: IInteraction[];
}

export interface IState {
    analytics: IAnalyticsState;
}

export const ANALYTICS_IMPORT_REQUEST = 'ANALYTICS_IMPORT_REQUEST';
export const ANALYTICS_IMPORT_SUCCESS = 'ANALYTICS_IMPORT_SUCCESS';
export const ANALYTICS_IMPORT_ERROR = 'ANALYTICS_IMPORT_ERROR';

export interface IAnalyticsImportRequestAction {
    payload: {};
    type: typeof ANALYTICS_IMPORT_REQUEST;
}

export interface IAnalyticsImportSuccessAction {
    payload: {
        users: IUser[];
        interactions: IInteraction[];
    };
    type: typeof ANALYTICS_IMPORT_SUCCESS;
}

export interface IAnalyticsImportErrorAction {
    payload: {
        message: string;
    };
    type: typeof ANALYTICS_IMPORT_ERROR;
}

export type AnalyticsActionTypes =
    | IAnalyticsImportErrorAction
    | IAnalyticsImportRequestAction
    | IAnalyticsImportSuccessAction;
