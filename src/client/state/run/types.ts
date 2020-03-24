import * as H5P from 'h5p-nodejs-library';

// types

export interface IAnalytics {
    _id: string;
    accessed_at: number;
    data: IData[];
    h5p_id: string;
}
export interface IData {
    contentId: string;
    finished: number;
    maxScore: number;
    opened: number;
    score: number;
}

// state (reducer)
export interface IRunState {
    analytics: any;
    h5p: any;
}
export interface IState {
    run: IRunState;
}

// actions

export interface IGetAnalyticsRequestAction {
    payload: {
        analytics_id: string;
    };
    type: typeof RUN_GET_ANALYTICS_REQUEST;
}

export interface IGetAnalyticsErrorAction {
    error: Error;
    payload: {
        analytics_id: string;
    };
    type: typeof RUN_GET_ANALYTICS_ERROR;
}

export interface IGetAnalyticsSuccessAction {
    payload: IAnalytics;
    type: typeof RUN_GET_ANALYTICS_SUCCESS;
}

export type GetAnalyticsActions =
    | IGetAnalyticsErrorAction
    | IGetAnalyticsRequestAction
    | IGetAnalyticsSuccessAction;

export interface IGetH5PRequestAction {
    payload: {
        id: string;
    };
    type: typeof RUN_GET_H5P_REQUEST;
}

export interface IGetH5PErrorAction {
    error: Error;
    payload: {
        id: string;
    };
    type: typeof RUN_GET_H5P_ERROR;
}

export interface IGetH5PSuccessAction {
    payload: {
        id: string;
        metadata: H5P.IContentMetadata;
        parameters: any;
    };
    type: typeof RUN_GET_H5P_SUCCESS;
}

export type GetH5PActions =
    | IGetH5PErrorAction
    | IGetH5PRequestAction
    | IGetH5PSuccessAction;

export interface IRunUploadRequestAction {
    payload: {
        file: File;
    };
    type: typeof RUN_UPLOAD_REQUEST;
}

export interface IRunUploadErrorAction {
    error: Error;
    payload: {};
    type: typeof RUN_UPLOAD_ERROR;
}

export interface IRunUploadSuccessAction {
    payload: {
        analytics_id: string;
        h5p_id: string;
    };
    type: typeof RUN_UPLOAD_SUCCESS;
}

export type UploadActions =
    | IRunUploadErrorAction
    | IRunUploadRequestAction
    | IRunUploadSuccessAction;

export type RunActions = UploadActions | GetAnalyticsActions | GetH5PActions;

// constants

export const RUN_GET_ANALYTICS_ERROR = 'RUN_GET_ANALYTICS_ERROR';
export const RUN_GET_ANALYTICS_REQUEST = 'RUN_GET_ANALYTICS_REQUEST';
export const RUN_GET_ANALYTICS_SUCCESS = 'RUN_GET_ANALYTICS_SUCCESS';

export const RUN_GET_H5P_ERROR = 'RUN_GET_H5P_ERROR';
export const RUN_GET_H5P_REQUEST = 'RUN_GET_H5P_REQUEST';
export const RUN_GET_H5P_SUCCESS = 'RUN_GET_H5P_SUCCESS';

export const RUN_UPLOAD_ERROR = 'RUN_UPLOAD_ERROR';
export const RUN_UPLOAD_REQUEST = 'RUN_UPLOAD_REQUEST';
export const RUN_UPLOAD_SUCCESS = 'RUN_UPLOAD_SUCCESS';
