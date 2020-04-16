// state (reducer)

export interface IState {
    checking_for_updates: boolean;
    error?: string;
    update_available: boolean;
    update_downloaded: boolean;
    update_info?: UpdateInfo;
    update_progress?: UpdateProgress;
}

export interface UpdateInfo {
    files: string[];
    releaseDate: string;
    releaseName: string;
    releaseNotes: string;
    version: string;
}

export interface UpdateProgress {
    bytesPerSecond: any;
    percent: number;
    progress: any;
    total: any;
    transferred: any;
}

// actions
export interface IUpdateDownloadedAction {
    payload: {
        info: UpdateInfo;
    };
    type: typeof UPDATE_DOWNLOADED;
}

export interface IUpdateAvailableAction {
    payload: {
        info: UpdateInfo;
    };
    type: typeof UPDATE_AVAILABLE;
}

export interface IUpdateErrorAction {
    payload: {
        error: string;
    };
    type: typeof UPDATE_ERROR;
}

export interface IUpdateCheckingForUpdateAction {
    payload: {};
    type: typeof UPDATE_CHECKING_FOR_UPDATE;
}

export interface IUpdateNotAvailable {
    payload: {};
    type: typeof UPDATE_NOT_AVAILABLE;
}

export interface IUpdateProgressAction {
    payload: UpdateProgress;
    type: typeof UPDATE_PROGRESS;
}

export type ActionTypes =
    | IUpdateAvailableAction
    | IUpdateDownloadedAction
    | IUpdateErrorAction
    | IUpdateCheckingForUpdateAction
    | IUpdateNotAvailable
    | IUpdateProgressAction;

// constants

export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const UPDATE_DOWNLOADED = 'UPDATE_DOWNLOADED';
export const UPDATE_ERROR = 'UPDATE_ERROR';
export const UPDATE_CHECKING_FOR_UPDATE = 'UPDATE_CHECKING_FOR_UPDATE';
export const UPDATE_NOT_AVAILABLE = 'UPDATE_NOT_AVAILABLE';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';
