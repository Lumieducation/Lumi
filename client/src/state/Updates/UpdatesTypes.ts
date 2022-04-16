export interface IState {
    updates: IUpdatesState;
}

export interface IUpdateInfo {
    // derived from https://www.electron.build/auto-update#UpdateInfo
    version: string;
    releaseName: string;
    releaseNotes: string;
    releaseDate: string;
}

export interface IUpdatesState {
    checkingForUpdates: boolean;
    updateInfo: IUpdateInfo;
    downloadProgress: {
        // dervied from https://www.electron.build/auto-update#event-download-progress
        progress: number;
        bytesPersecond: number;
        percent: number;
        total: number;
        transferred: number;
    };
}

export const UPDATES_GET_UPDATES_REQUEST = 'UPDATES_GET_UPDATES_REQUEST';
export const UPDATES_GET_UPDATES_SUCCESS = 'UPDATES_GET_UPDATES_SUCCESS';
export const UPDATES_GET_UPDATES_ERROR = 'UPDATES_GET_UPDATES_ERROR';

export const UPDATES_UPDATE_REQUEST = 'UPDATES_UPDATE_REQUEST';
export const UPDATES_UPDATE_SUCCESS = 'UPADTES_UPDATE_SUCCESS';
export const UPDATES_UPDATE_ERROR = 'UPADTES_UPDATE_ERROR';

export interface IUpdateRequestAction {
    type: typeof UPDATES_UPDATE_REQUEST;
}

export interface IUpdateSuccessAction {
    type: typeof UPDATES_UPDATE_SUCCESS;
}
export interface IUpdateErrorAction {
    type: typeof UPDATES_UPDATE_ERROR;
}

export interface IGetUpdatesRequestAction {
    payload: {};
    type: typeof UPDATES_GET_UPDATES_REQUEST;
}

export interface IGetUpdatesSuccessAction {
    payload: IUpdateInfo;
    type: typeof UPDATES_GET_UPDATES_SUCCESS;
}
export interface IGetUpdatesErrorAction {
    payload: {
        error: string;
    };
    type: typeof UPDATES_GET_UPDATES_ERROR;
}

export type IUpdatesActionTypes =
    | IGetUpdatesRequestAction
    | IGetUpdatesSuccessAction
    | IGetUpdatesErrorAction
    | IUpdateErrorAction
    | IUpdateRequestAction
    | IUpdateSuccessAction;
