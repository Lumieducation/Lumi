import { ContentId } from '@lumieducation/h5p-server';
import { IGetSettingsErrorAction } from '../Settings/SettingsTypes';

export interface IRun {
    runId: string;
    title: string;
    mainLibrary: string;
}

type uploadProgressStates =
    | 'not_started'
    | 'pending'
    | 'success'
    | 'error'
    | 'processing';
export interface IRunState {
    runs: IRun[];
    showSetupDialog: boolean;
    showConnectionErrorDialog: boolean;
    showUploadDialog: boolean;
    uploadProgress: {
        runId?: string;
        state: uploadProgressStates;
        progress: number;
    };
}

export interface IState {
    run: IRunState;
}

export const RUN_UPDATE_STATE = 'RUN_UPDATE_STATE';

export interface IRunUpdateState {
    payload: Partial<IRunState>;
    type: typeof RUN_UPDATE_STATE;
}

export const RUN_GET_RUNS_REQUEST = 'RUN_GET_RUNS_REQUEST';
export const RUN_GET_RUNS_SUCCESS = 'RUN_GET_RUNS_SUCCESS';
export const RUN_GET_RUNS_ERROR = 'RUN_GET_RUNS_ERROR';
export const RUN_NOT_AUTHORIZED = 'RUN_NOT_AUTHORIZED';

export interface IGetRunsRequestAction {
    payload: {};
    type: typeof RUN_GET_RUNS_REQUEST;
}

export interface IGetRunsSuccessAction {
    payload: {
        runList: IRun[];
    };
    type: typeof RUN_GET_RUNS_SUCCESS;
}
export interface IGetRunsErrorAction {
    payload: {
        error: string;
    };
    type: typeof RUN_GET_RUNS_ERROR;
}

export const RUN_UPLOAD_REQUEST = 'RUN_UPLOAD_REQUEST';
export const RUN_UPLOAD_SUCCESS = 'RUN_UPLOAD_SUCCESS';
export const RUN_UPLOAD_ERROR = 'RUN_UPLOAD_ERROR';

export interface IRunUploadRequestAction {
    payload: {
        path?: string;
    };
    type: typeof RUN_UPLOAD_REQUEST;
}

export interface IRunUploadSuccessAction {
    payload: {
        runId: ContentId;
    };
    type: typeof RUN_UPLOAD_SUCCESS;
}
export interface IRunUploadErrorAction {
    payload: {
        error: string;
    };
    type: typeof RUN_UPLOAD_ERROR;
}

export const RUN_DELETE_REQUEST = 'RUN_DELETE_REQUEST';
export const RUN_DELETE_SUCCESS = 'RUN_DELETE_SUCCESS';
export const RUN_DELETE_ERROR = 'RUN_DELETE_ERROR';

export interface IDeleteRunRequestAction {
    payload: {
        id: string;
        secret: string;
    };
    type: typeof RUN_DELETE_REQUEST;
}

export interface IDeleteRunSuccessAction {
    payload: IRunState;
    type: typeof RUN_DELETE_SUCCESS;
}
export interface IDeleteRunErrorAction {
    payload: {
        error: string;
    };
    type: typeof RUN_DELETE_ERROR;
}

export type RunActionTypes =
    | IGetRunsRequestAction
    | IGetRunsSuccessAction
    | IGetSettingsErrorAction
    | IRunUploadRequestAction
    | IRunUploadSuccessAction
    | IRunUploadErrorAction
    | IRunUpdateState
    | IDeleteRunRequestAction
    | IDeleteRunSuccessAction
    | IDeleteRunErrorAction;
