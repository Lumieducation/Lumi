import type { IInteraction } from '@lumieducation/xapi-aggregator';

export interface IFile {
    file: string;
    name: string;
    contentHash: string;
    interactions: IInteraction[];
    results: number[];
    error?: boolean;
    code?: string;
}
// state

export interface IAnalyticsState {
    files: IFile[];
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
        files: IFile[];
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
