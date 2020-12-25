import {
    IH5PExportRequestAction,
    IH5PExportSuccessAction,
    IH5PLoadEditorContentSuccessAction,
    IH5PLoadPlayerContentRequestAction,
    IH5PLoadPlayerContentSuccessAction,
    IH5PSaveContentRequestAction,
    IH5PSaveContentSuccessAction,
    IH5PExportErrorAction
} from '../h5p/H5PTypes';

import { IEditorLoadedAction } from './H5PEditorActions';

export type ContentId = string;
export type TabState =
    | 'savingSuccess'
    | 'savingError'
    | 'saving'
    | 'error'
    | 'closing'
    | 'opening'
    | 'success';

export type SaveButtonState =
    | 'default'
    | 'hidden'
    | 'success'
    | 'loading'
    | 'error';

export const H5PEDITOR_OPEN_TAB = 'H5PEDITOR_OPEN_TAB';
export const H5PEDITOR_CLOSE_TAB = 'H5PEDITOR_CLOSE_TAB';
export const H5PEDITOR_SELECT_TAB = 'H5PEDITOR_SELECT_TAB';
export const H5PEDITOR_RESET_SAVINGSTATE = 'H5PEDITOR_RESET_SAVINGSTATE';
export const H5PEDITOR_UPDATE_TAB = 'H5PEDITOR_UPDATE_TAB';
export const H5PEDITOR_LOADED = 'H5PEDITOR_LOADED';
export const H5PEDITOR_SAVED = 'H5PEDITOR_SAVED';
export const H5PEDITOR_SAVE_ERROR = 'H5PEDITOR_SAVE_ERROR';
export const H5PPLAYER_INITIALIZED = 'H5PPLAYER_INITIALIZED';

export enum Modes {
    view,
    edit
}

export interface ITab {
    contentId?: ContentId;
    id: string;
    loadingIndicator: boolean;
    saveButtonState: SaveButtonState;
    viewDisabled: boolean;
    mainLibrary: string;
    name: string;
    path?: string;
    state: TabState;
    mode: Modes;
}
export interface IH5PEditorState {
    activeTabIndex: number;
    tabList: ITab[];
}

export interface IState {
    h5peditor: IH5PEditorState;
}
export interface IOpenTabAction {
    payload: {
        id: string;
        tab?: Partial<ITab>;
    };
    type: typeof H5PEDITOR_OPEN_TAB;
}

export interface ITabUpdateAction {
    payload: {
        tabId: string;
        update: any;
    };
    type: typeof H5PEDITOR_UPDATE_TAB;
}
export interface ICloseTabAction {
    payload: {
        id: string;
    };
    type: typeof H5PEDITOR_CLOSE_TAB;
}

export interface ISelectTabAction {
    payload: {
        value: number;
    };
    type: typeof H5PEDITOR_SELECT_TAB;
}
export type TabActionTypes =
    | ICloseTabAction
    | IOpenTabAction
    | ISelectTabAction
    | ITabUpdateAction
    | IH5PLoadPlayerContentRequestAction
    | IH5PLoadPlayerContentSuccessAction
    | IH5PLoadEditorContentSuccessAction
    | IH5PSaveContentSuccessAction
    | IH5PSaveContentRequestAction
    | IEditorLoadedAction
    | IH5PExportRequestAction
    | IH5PExportSuccessAction
    | IH5PExportErrorAction;
