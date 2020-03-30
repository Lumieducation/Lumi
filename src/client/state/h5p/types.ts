import { IContentMetadata } from 'h5p-nodejs-library';

// eslint-disable-next-line
import Superagent from 'superagent';

// types

export type ContentId = number;

export interface IH5P {
    id: ContentId;
    library: string;
    params: {
        metadata: IContentMetadata;
        params: any;
    };
}

// state (reducer)
export interface IH5P {}

export interface IState {}

// actions

export interface IH5PDeleteRequestAction {
    payload: {
        contentId: ContentId;
    };
    type: typeof H5P_DELETE_REQUEST;
}

export interface IH5PDeleteErrorAction {
    error: Error;
    payload: {
        contentId: ContentId;
    };
    type: typeof H5P_DELETE_ERROR;
}

export interface IH5PDeleteSuccessAction {
    payload: {
        contentId: ContentId;
    };
    type: typeof H5P_DELETE_SUCCESS;
}

export type DeleteActions =
    | IH5PDeleteErrorAction
    | IH5PDeleteRequestAction
    | IH5PDeleteSuccessAction;

export interface IH5PExportErrorAction {
    payload: {
        id: string;
        path: string;
        response: Superagent.Response;
    };
    type: typeof H5P_EXPORT_ERROR;
}
export interface IH5PExportRequestAction {
    payload: {
        id: string;
        path: string;
    };
    type: typeof H5P_EXPORT_REQUEST;
}

export interface IH5PExportSuccessAction {
    payload: {
        h5p: IH5P;
        id: string;
        path: string;
    };
    type: typeof H5P_EXPORT_SUCCESS;
}

export type ExportActions =
    | IH5PExportErrorAction
    | IH5PExportRequestAction
    | IH5PExportSuccessAction;

export interface IH5PImportErrorAction {
    payload: {
        path: string;
        response: Superagent.Response;
    };
    type: typeof H5P_IMPORT_ERROR;
}
export interface IH5PImportRequestAction {
    payload: {
        path: string;
    };
    type: typeof H5P_IMPORT_REQUEST;
}

export interface IH5PImportSuccessAction {
    payload: {
        h5p: IH5P;
        path: string;
    };
    type: typeof H5P_IMPORT_SUCCESS;
}

export interface IH5PUpdateErrorAction {
    payload: {
        h5p: IH5P;
        response: Superagent.Response;
    };
    type: typeof H5P_UPDATE_ERROR;
}
export interface IH5PUpdateRequestAction {
    payload: {
        h5p: IH5P;
    };
    type: typeof H5P_UPDATE_REQUEST;
}

export interface IH5PUpdateSuccessAction {
    payload: {
        h5p: IH5P;
    };
    type: typeof H5P_UPDATE_SUCCESS;
}

// constants

export const H5P_DELETE_ERROR = 'H5P_DELETE_ERROR';
export const H5P_DELETE_REQUEST = 'H5P_DELETE_REQUEST';
export const H5P_DELETE_SUCCESS = 'H5P_DELETE_SUCCESS';
export const H5P_EXPORT_ERROR = 'H5P_EXPORT_ERROR';
export const H5P_EXPORT_REQUEST = 'H5P_EXPORT_REQUEST';
export const H5P_EXPORT_SUCCESS = 'H5P_EXPORT_SUCCESS';
export const H5P_IMPORT_ERROR = 'H5P_IMPORT_ERROR';
export const H5P_IMPORT_REQUEST = 'H5P_IMPORT_REQUEST';
export const H5P_IMPORT_SUCCESS = 'H5P_IMPORT_SUCCESS';
export const H5P_UPDATE_ERROR = 'H5P_UPDATE_ERROR';
export const H5P_UPDATE_REQUEST = 'H5P_UPDATE_REQUEST';
export const H5P_UPDATE_SUCCESS = 'H5P_UPDATE_SUCCESS';

// api

export type exportH5P = (id: string, path: string) => Promise<{ path: string }>;
export type importH5P = (path: string) => Promise<IH5P>;
export type updateH5P = (h5p: IH5P) => Promise<IH5P>;

export interface IAPI {
    export: exportH5P;
    import: importH5P;
    update: updateH5P;
}
