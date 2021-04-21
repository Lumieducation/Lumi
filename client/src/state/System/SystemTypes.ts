export interface IState {
    system: ISystemState;
}

export interface ISystemState {
    platformSupportsUpdates: boolean;
    platform: Platform;
}

type Platform = 'mac' | 'mas' | 'win' | 'win-store' | 'linux' | NodeJS.Platform;

export const SYSTEM_GET_SYSTEM_REQUEST = 'SYSTEM_GET_SYSTEM_REQUEST';
export const SYSTEM_GET_SYSTEM_SUCCESS = 'SYSTEM_GET_SYSTEM_SUCCESS';
export const SYSTEM_GET_SYSTEM_ERROR = 'SYSTEM_GET_SYSTEM_ERROR';

export interface IGetSystemRequestAction {
    payload: {};
    type: typeof SYSTEM_GET_SYSTEM_REQUEST;
}

export interface IGetSystemSuccessAction {
    payload: ISystemState;
    type: typeof SYSTEM_GET_SYSTEM_SUCCESS;
}
export interface IGetSystemErrorAction {
    payload: {
        error: string;
    };
    type: typeof SYSTEM_GET_SYSTEM_ERROR;
}

export type ISystemActionTypes =
    | IGetSystemErrorAction
    | IGetSystemRequestAction
    | IGetSystemSuccessAction;
