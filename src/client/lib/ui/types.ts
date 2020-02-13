export type RequestStates = undefined | 'pending' | 'error' | 'success';

export enum Modes {
    view,
    edit
}

export interface IUIState {
    leftDrawerOpen: boolean;
    mode: Modes;
    requestStates: any;
}

export interface IState {
    ui: IUIState;
}

export interface IUIChangeRequestStateAction {
    payload: {
        id: string;
        message?: string;
        progress?: number;
        state: RequestStates;
    };
    type: typeof UI_CHANGE_REQUESTSTATE;
}

export interface IOpenLeftDrawerAction {
    type: typeof UI_OPEN_LEFT_DRAWER;
}

export interface IChangeModeAction {
    payload: { mode: Modes };
    type: typeof UI_CHANGE_MODE;
}

export interface ICloseLeftDrawerAction {
    type: typeof UI_CLOSE_LEFT_DRAWER;
}

export type UIActionTypes =
    | IOpenLeftDrawerAction
    | ICloseLeftDrawerAction
    | IChangeModeAction
    | IUIChangeRequestStateAction;

export const UI_OPEN_LEFT_DRAWER = 'UI_OPEN_LEFT_DRAWER';
export const UI_CLOSE_LEFT_DRAWER = 'UI_CLOSE_LEFT_DRAWER';
export const UI_CHANGE_MODE = 'UI_CHANGE_MODE';
export const UI_CHANGE_REQUESTSTATE = 'UI_CHANGE_REQUESTSTATE';
