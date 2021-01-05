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
    params: {
        metadata: IContentMetadata;
        params: any;
    };
}

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

export const H5P_LOADPLAYERCONTENT_REQUEST = 'H5P_LOADPLAYERCONTENT_REQUEST';
export const H5P_LOADPLAYERCONTENT_SUCCESS = 'H5P_LOADPLAYERCONTENT_SUCCESS';
export const H5P_LOADPLAYERCONTENT_ERROR = 'H5P_LOADPLAYERCONTENT_ERROR';

export const H5P_LOADEDITORCONTENT_REQUEST = 'H5P_LOADEDITORCONTENT_REQUEST';
export const H5P_LOADEDITORCONTENT_SUCCESS = 'H5P_LOADEDITORCONTENT_SUCCESS';
export const H5P_LOADEDITORCONTENT_ERROR = 'H5P_LOADEDITORCONTENT_ERROR';

export const H5P_SAVECONTENT_REQUEST = 'H5P_SAVECONTENT_REQUEST';
export const H5P_SAVECONTENT_SUCCESS = 'H5P_SAVECONTENT_SUCCESS';
export const H5P_SAVECONTENT_ERROR = 'H5P_SAVECONTENT_ERROR';

export const H5PEDITOR_EXPORTHTML_REQUEST = 'H5PEDITOR_EXPORTHTML_REQUEST';
export const H5PEDITOR_EXPORTHTML_SUCCESS = 'H5PEDITOR_EXPORTHTML_SUCCESS';
export const H5PEDITOR_EXPORTHTML_ERROR = 'H5PEDITOR_EXPORTHTML_ERROR';

export enum Modes {
    view,
    edit
}

export interface ITab {
    contentId?: ContentId;
    id: string;
    loadingIndicator: boolean;
    saveButtonState: SaveButtonState;
    exportButtonState: SaveButtonState;
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
    | IH5PExportErrorAction
    | IH5PEditorExportHtmlActions;

export interface IH5PEditorExportHtmlRequestAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORTHTML_REQUEST;
}

export interface IH5PEditorExportHtmlSuccessAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORTHTML_SUCCESS;
}

export interface IH5PEditorExportHtmlErrorAction {
    payload: {
        contentId: string;
    };
    type: typeof H5PEDITOR_EXPORTHTML_ERROR;
}

export type IH5PEditorExportHtmlActions =
    | IH5PEditorExportHtmlRequestAction
    | IH5PEditorExportHtmlSuccessAction
    | IH5PEditorExportHtmlErrorAction;

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

export interface IH5PSaveContentRequestAction {
    payload: {
        tabId: string;
        library: string;
        params: any;
    };
    type: typeof H5P_SAVECONTENT_REQUEST;
}

export interface IH5PSaveContentSuccessAction {
    payload: {
        tabId: string;
        contentId: string;
        metadata: any;
    };
    type: typeof H5P_SAVECONTENT_SUCCESS;
}

export interface IH5PSaveContentErrorAction {
    payload: {
        tabId: string;
    };
    type: typeof H5P_SAVECONTENT_ERROR;
}

export type SaveContentActions =
    | IH5PSaveContentRequestAction
    | IH5PSaveContentSuccessAction
    | IH5PSaveContentErrorAction;

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

// api

export type exportH5P = (id: string, path: string) => Promise<{ path: string }>;
export type importH5P = (path: string) => Promise<IH5P>;
export type updateH5P = (h5p: IH5P) => Promise<IH5P>;

export interface IAPI {
    export: exportH5P;
    import: importH5P;
    update: updateH5P;
}
