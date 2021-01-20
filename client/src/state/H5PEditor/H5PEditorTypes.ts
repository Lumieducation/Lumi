import {
    IPlayerModel,
    IEditorModel,
    IContentMetadata
} from '@lumieducation/h5p-server';

// eslint-disable-next-line
import Superagent from 'superagent';

// types

import { IEditorLoadedAction } from './H5PEditorActions';

export type ContentId = string;

export interface IH5P {
    id: ContentId;
    library: string;
    metadata: IContentMetadata;
    parameters: any;
}

export const H5PEDITOR_OPEN_TAB = 'H5PEDITOR_OPEN_TAB';
export const H5PEDITOR_CLOSE_TAB = 'H5PEDITOR_CLOSE_TAB';
export const H5PEDITOR_SELECT_TAB = 'H5PEDITOR_SELECT_TAB';
export const H5PEDITOR_RESET_SAVINGSTATE = 'H5PEDITOR_RESET_SAVINGSTATE';
export const H5PEDITOR_UPDATE_TAB = 'H5PEDITOR_UPDATE_TAB';
export const H5PEDITOR_LOADED = 'H5PEDITOR_LOADED';
export const H5PEDITOR_SAVED = 'H5PEDITOR_SAVED';
export const H5PPLAYER_INITIALIZED = 'H5PPLAYER_INITIALIZED';

export enum Modes {
    view,
    edit
}

export interface ITab {
    contentId?: ContentId;
    id: string;
    loadingIndicator: boolean;
    viewDisabled: boolean;
    mainLibrary: string;
    name: string;
    path?: string;
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
export type H5PEditorActionTypes =
    | ICloseTabAction
    | IOpenTabAction
    | ISelectTabAction
    | ITabUpdateAction
    | IH5PLoadPlayerContentRequestAction
    | IH5PLoadPlayerContentSuccessAction
    | IH5PLoadEditorContentSuccessAction
    | IH5PUpdateContentSuccessAction
    | IH5PUpdateContentRequestAction
    | IEditorLoadedAction
    | IH5PEditorSaveRequestAction
    | IH5PEditorSaveSuccessAction
    | IH5PEditorSaveCancelAction
    | IH5PEditorSaveErrorAction
    | IH5PEditorExportActions
    | IH5PImportRequestAction
    | IH5PImportSuccessAction
    | IH5PImportErrorAction;

//

export const H5PEDITOR_ERROR = 'H5PEDITOR_ERROR';

export interface IH5PEditorError {
    payload: {
        tabId: string;
        message: string;
    };
    type: typeof H5PEDITOR_ERROR;
}

// Export
export const H5PEDITOR_EXPORT_REQUEST = 'H5PEDITOR_EXPORT_REQUEST';
export const H5PEDITOR_EXPORT_SUCCESS = 'H5PEDITOR_EXPORT_SUCCESS';
export const H5PEDITOR_EXPORT_ERROR = 'H5PEDITOR_EXPORT_ERROR';
export const H5PEDITOR_EXPORT_CANCEL = 'H5PEDITOR_EXPORT_CANCEL';

export interface IH5PEditorExportRequestAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORT_REQUEST;
}

export interface IH5PEditorExportSuccessAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORT_SUCCESS;
}

export interface IH5PEditorExportErrorAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORT_ERROR;
}

export interface IH5PEditorExportCancelAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORT_CANCEL;
}

export type IH5PEditorExportActions =
    | IH5PEditorExportRequestAction
    | IH5PEditorExportSuccessAction
    | IH5PEditorExportErrorAction
    | IH5PEditorExportCancelAction;

// LoadEditorContent
export const H5P_LOADEDITORCONTENT_REQUEST = 'H5P_LOADEDITORCONTENT_REQUEST';
export const H5P_LOADEDITORCONTENT_SUCCESS = 'H5P_LOADEDITORCONTENT_SUCCESS';
export const H5P_LOADEDITORCONTENT_ERROR = 'H5P_LOADEDITORCONTENT_ERROR';

export interface IH5PLoadEditorContentRequestAction {
    payload: {
        contentId: string;
        tabId: string;
    };
    type: typeof H5P_LOADEDITORCONTENT_REQUEST;
}

export interface IH5PLoadEditorContentSuccessAction {
    payload: {
        contentId: string;
        content: IEditorModel;
        tabId: string;
    };
    type: typeof H5P_LOADEDITORCONTENT_SUCCESS;
}

export interface IH5PLoadEditorContentErrorAction {
    payload: {
        tabId: string;
    };
    type: typeof H5P_LOADEDITORCONTENT_ERROR;
}

export type LoadEditorContentActions =
    | IH5PLoadEditorContentErrorAction
    | IH5PLoadEditorContentRequestAction
    | IH5PLoadEditorContentSuccessAction;

export const H5PEDITOR_UPDATE_REQUEST = 'H5PEDITOR_UPDATE_REQUEST';
export const H5PEDITOR_UPDATE_SUCCESS = 'H5PEDITOR_UPDATE_SUCCESS';
export const H5PEDITOR_UPDATE_ERROR = 'H5PEDITOR_UPDATE_ERROR';

export interface IH5PUpdateContentRequestAction {
    payload: {
        tabId: string;
        library: string;
        params: any;
    };
    type: typeof H5PEDITOR_UPDATE_REQUEST;
}

export interface IH5PUpdateContentSuccessAction {
    payload: {
        tabId: string;
        contentId: string;
        metadata: any;
    };
    type: typeof H5PEDITOR_UPDATE_SUCCESS;
}

export interface IH5PUpdateContentErrorAction {
    payload: {
        tabId: string;
    };
    type: typeof H5PEDITOR_UPDATE_ERROR;
}

export type UpdateContentActions =
    | IH5PUpdateContentRequestAction
    | IH5PUpdateContentSuccessAction
    | IH5PUpdateContentErrorAction;

export const H5P_LOADPLAYERCONTENT_REQUEST = 'H5P_LOADPLAYERCONTENT_REQUEST';
export const H5P_LOADPLAYERCONTENT_SUCCESS = 'H5P_LOADPLAYERCONTENT_SUCCESS';
export const H5P_LOADPLAYERCONTENT_ERROR = 'H5P_LOADPLAYERCONTENT_ERROR';

export interface IH5PLoadPlayerContentRequestAction {
    payload: {
        contentId: ContentId;
    };
    type: typeof H5P_LOADPLAYERCONTENT_REQUEST;
}

export interface IH5PLoadPlayerContentErrorAction {
    payload: {
        contentId: ContentId;
    };
    type: typeof H5P_LOADPLAYERCONTENT_ERROR;
}

export interface IH5PLoadPlayerContentSuccessAction {
    payload: {
        contentId: ContentId;
        content: IPlayerModel;
    };
    type: typeof H5P_LOADPLAYERCONTENT_SUCCESS;
}

export type LoadPlayerContentActions =
    | IH5PLoadPlayerContentErrorAction
    | IH5PLoadPlayerContentRequestAction
    | IH5PLoadPlayerContentSuccessAction;

export const H5P_DELETE_ERROR = 'H5P_DELETE_ERROR';
export const H5P_DELETE_REQUEST = 'H5P_DELETE_REQUEST';
export const H5P_DELETE_SUCCESS = 'H5P_DELETE_SUCCESS';

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

// Save

export const H5PEDITOR_SAVE_ERROR = 'H5PEDITOR_SAVE_ERROR';
export const H5PEDITOR_SAVE_REQUEST = 'H5PEDITOR_SAVE_REQUEST';
export const H5PEDITOR_SAVE_SUCCESS = 'H5PEDITOR_SAVE_SUCCESS';
export const H5PEDITOR_SAVE_CANCEL = 'H5PEDITOR_SAVE_CANCEL';

export interface IH5PEditorSaveErrorAction {
    payload: {
        id: string;
        path: string;
        response: Superagent.Response;
    };
    type: typeof H5PEDITOR_SAVE_ERROR;
}
export interface IH5PEditorSaveRequestAction {
    payload: {
        id: string;
        path: string;
    };
    type: typeof H5PEDITOR_SAVE_REQUEST;
}

export interface IH5PEditorSaveSuccessAction {
    payload: {
        h5p: IH5P;
        id: string;
        path: string;
    };
    type: typeof H5PEDITOR_SAVE_SUCCESS;
}

export interface IH5PEditorSaveCancelAction {
    payload: {};
    type: typeof H5PEDITOR_SAVE_CANCEL;
}

export type SaveActions =
    | IH5PEditorSaveErrorAction
    | IH5PEditorSaveRequestAction
    | IH5PEditorSaveSuccessAction
    | IH5PEditorSaveCancelAction;

// Import

export const H5P_IMPORT_ERROR = 'H5P_IMPORT_ERROR';
export const H5P_IMPORT_REQUEST = 'H5P_IMPORT_REQUEST';
export const H5P_IMPORT_SUCCESS = 'H5P_IMPORT_SUCCESS';

export interface IH5PImportErrorAction {
    error: { response: Superagent.Response };
    payload: {
        tabId: string;
        path: string;
    };
    type: typeof H5P_IMPORT_ERROR;
}
export interface IH5PImportRequestAction {
    payload: {
        tabId: string;
        path: string;
    };
    type: typeof H5P_IMPORT_REQUEST;
}

export interface IH5PImportSuccessAction {
    payload: {
        tabId: string;
        h5p: IH5P;
        path: string;
    };
    type: typeof H5P_IMPORT_SUCCESS;
}
