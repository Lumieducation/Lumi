import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import * as Sentry from '@sentry/browser';

import Logger from '../../helpers/Logger';

import * as H from 'history';

import {
    ContentId,
    ITab,
    H5PEditorActionTypes,
    H5PEDITOR_CLOSE_TAB,
    H5PEDITOR_OPEN_TAB,
    H5PEDITOR_SELECT_TAB,
    H5PEDITOR_UPDATE_TAB,
    H5PEDITOR_LOADED,
    H5PEDITOR_SAVED,
    H5PPLAYER_INITIALIZED,
    H5PEDITOR_ERROR,
    H5PEDITOR_BLURACTIVEELEMENT,
    IBlurActiveElementAction,
    DeleteActions,
    LoadPlayerContentActions,
    LoadEditorContentActions,
    UpdateContentActions,
    SaveActions,
    H5P_DELETE_ERROR,
    H5P_DELETE_REQUEST,
    H5P_DELETE_SUCCESS,
    H5PEDITOR_SAVE_ERROR,
    H5PEDITOR_SAVE_REQUEST,
    H5PEDITOR_SAVE_SUCCESS,
    H5P_IMPORT_ERROR,
    H5P_IMPORT_REQUEST,
    H5P_IMPORT_SUCCESS,
    H5P_LOADPLAYERCONTENT_REQUEST,
    H5P_LOADPLAYERCONTENT_SUCCESS,
    H5PEDITOR_UPDATE_REQUEST,
    H5PEDITOR_UPDATE_SUCCESS,
    H5PEDITOR_UPDATE_ERROR,
    H5P_LOADEDITORCONTENT_REQUEST,
    H5P_LOADEDITORCONTENT_SUCCESS,
    H5PEDITOR_EXPORT_REQUEST,
    H5PEDITOR_EXPORT_SUCCESS,
    H5PEDITOR_EXPORT_ERROR,
    H5PEDITOR_EXPORT_CANCEL,
    H5PEDITOR_SAVE_CANCEL,
    H5PEDITOR_UPDATE_CONTENT_SERVER,
    IH5PEditorOpenExportDialogAction,
    H5PEDITOR_OPEN_EXPORT_DIALOG
} from './H5PEditorTypes';

import * as selectors from './H5PEditorSelectors';
import shortid from 'shortid';

import { track } from '../track/actions';

import store from '../index';

import * as h5pApi from '../../services/H5PApi';
import * as filesApi from '../../services/FilesAPI';

const log = new Logger('actions:tabs');

declare var window: {
    h5peditor: any;
    document: {
        activeElement: {
            blur: () => void;
        };
    };
};

export function editorLoaded(tabId: string): any {
    return {
        payload: { tabId },
        type: H5PEDITOR_LOADED
    };
}

export function editorSaved(tabId: string): any {
    return {
        payload: { tabId },
        type: H5PEDITOR_SAVED
    };
}

export function editorSaveError(tabId: string, message: string): any {
    return {
        payload: { tabId, message },
        type: H5PEDITOR_ERROR
    };
}

export function playerInitialized(tabId: string): any {
    return {
        payload: { tabId },
        type: H5PPLAYER_INITIALIZED
    };
}

export interface IEditorLoadedAction {
    payload: {
        tabId: string;
    };
    type: typeof H5PEDITOR_LOADED;
}

export function openExportDialog(): IH5PEditorOpenExportDialogAction {
    return {
        payload: {},
        type: H5PEDITOR_OPEN_EXPORT_DIALOG
    };
}

export function blurActiveElement(): IBlurActiveElementAction {
    window.document.activeElement?.blur();
    return {
        type: H5PEDITOR_BLURACTIVEELEMENT
    };
}

export function cancelExportH5P(contentId?: string) {
    log.info(`canceling export`);
    return async (dispatch: any) => {
        dispatch({
            payload: { contentId },
            type: H5PEDITOR_EXPORT_CANCEL
        });
    };
}

export function exportH5P(
    includeReporter: boolean,
    format: 'bundle' | 'external' | 'scorm',
    options: {
        addCss: boolean;
        cssFileHandleId: string;
        marginX: number;
        marginY: number;
        masteryScore?: string;
        maxWidth: number;
        restrictWidthAndCenter: boolean;
        showEmbed: boolean;
        showRights: boolean;
    }
): any {
    return async (dispatch: any) => {
        try {
            await dispatch(updateContentOnServer());

            const data = await window.h5peditor.current?.save(); // this dispatches updateContent()
            dispatch({
                payload: { contentId: data.contentId, includeReporter, format },
                type: H5PEDITOR_EXPORT_REQUEST
            });

            try {
                await filesApi.exportContent(
                    data.contentId,
                    includeReporter,
                    format,
                    options
                );

                // TODO: change tracking
                dispatch(
                    track(
                        'H5P',
                        'export',
                        `${format}-${
                            includeReporter
                                ? 'with_reporter'
                                : 'without_reporter'
                        }`
                    )
                );
                dispatch({
                    payload: {
                        contentId: data.contentId,
                        includeReporter,
                        format
                    },
                    type: H5PEDITOR_EXPORT_SUCCESS
                });
            } catch (error: any) {
                if (error.status === 499) {
                    // dispatched if the user cancel the system's save dialog.
                    dispatch(cancelExportH5P(data.contentId));
                } else {
                    Sentry.captureException(error);

                    dispatch({
                        payload: {
                            error,
                            contentId: data.contentId
                        },
                        type: H5PEDITOR_EXPORT_ERROR
                    });
                }
            }
        } catch (error: any) {
            Sentry.captureException(error);

            dispatch({
                payload: {
                    error
                },
                type: H5PEDITOR_EXPORT_ERROR
            });
        }
    };
}

export function openH5P(): any {
    return (dispatch: any) => {
        filesApi
            .pickH5PFiles()
            .then((response) => {
                const files = response.body;

                files.forEach(
                    (file: { fileHandleId: string; path: string }) => {
                        dispatch(importH5P(file.fileHandleId, file.path));
                    }
                );
            })
            .catch((error) => Sentry.captureException(error));
        return dispatch;
    };
}

export function openTab(tab?: Partial<ITab>): any {
    log.info(`opening tab`);
    return async (dispatch: any) => {
        dispatch(
            track(
                'H5PEditor',
                'openTab',
                tab?.fileHandleId ? 'existing h5p' : 'new h5p'
            )
        );

        dispatch({
            payload: {
                tab,
                id: shortid()
            },
            type: H5PEDITOR_OPEN_TAB
        });
    };
}

export function closeTab(id: string): any {
    log.info(`closing tab with id ${id}`);
    return async (dispatch: any) => {
        const tab = selectors.tab(store.getState(), id);
        dispatch(track('H5PEditor', 'closeTab'));
        if (tab && tab.contentId) {
            dispatch(deleteH5P(tab.contentId));
        }

        dispatch({
            payload: { id },
            type: H5PEDITOR_CLOSE_TAB
        });
    };
}

export function selectTab(value: number): H5PEditorActionTypes {
    log.info(`selecting tab ${value}`);
    return {
        payload: { value },
        type: H5PEDITOR_SELECT_TAB
    };
}

export function updateTab(
    tabId: string,
    update: Partial<ITab>
): H5PEditorActionTypes {
    return {
        payload: { tabId, update },
        type: H5PEDITOR_UPDATE_TAB
    };
}

export function updateContentOnServer(): any {
    return async (dispatch: any) => {
        // We remove the focus from the current element to make H5P save all
        // changes in text fields
        dispatch(blurActiveElement());

        dispatch({
            type: H5PEDITOR_UPDATE_CONTENT_SERVER
        });

        try {
            const data = await window.h5peditor.current?.save();
            return data;
        } catch (error: any) {
            Sentry.captureException(error);
            return;
        }
    };
}

export function updateContent(
    tabId: string,
    contentId: string,
    requestBody: { library: string; params: any }
): ThunkAction<void, null, null, UpdateContentActions> {
    return async (
        dispatch: ThunkDispatch<null, null, UpdateContentActions>
    ) => {
        dispatch({
            payload: {
                tabId,
                library: requestBody.library,
                params: requestBody.params
            },
            type: H5PEDITOR_UPDATE_REQUEST
        });

        try {
            if (contentId) {
                const response = JSON.parse(
                    (await h5pApi.updateContent(contentId, requestBody)).text
                );

                dispatch({
                    payload: {
                        tabId,
                        contentId: response.contentId,
                        metadata: response.metadata
                    },
                    type: H5PEDITOR_UPDATE_SUCCESS
                });

                return response;
            }

            const response = JSON.parse(
                (await h5pApi.createContent(requestBody)).text
            );
            dispatch({
                payload: {
                    tabId,
                    contentId: response.contentId,
                    metadata: response.metadata
                },
                type: H5PEDITOR_UPDATE_SUCCESS
            });

            return response;
        } catch (error: any) {
            Sentry.captureException(error);
            dispatch({
                payload: {
                    tabId
                },
                type: H5PEDITOR_UPDATE_ERROR
            });
        }
    };
}

export function loadEditorContent(
    tabId: string,
    contentId: ContentId
): ThunkAction<void, null, null, LoadEditorContentActions> {
    return async (
        dispatch: ThunkDispatch<null, null, LoadEditorContentActions>
    ) => {
        dispatch({
            payload: { contentId, tabId },
            type: H5P_LOADEDITORCONTENT_REQUEST
        });

        try {
            const content = JSON.parse(
                (await h5pApi.loadEditorContent(contentId)).text
            );

            dispatch({
                payload: { contentId, tabId, content },
                type: H5P_LOADEDITORCONTENT_SUCCESS
            });

            return content;
        } catch (error: any) {
            Sentry.captureException(error);

            throw new Error(error);
        }
    };
}

export function loadPlayerContent(
    contentId: ContentId
): ThunkAction<void, null, null, LoadPlayerContentActions> {
    if (!contentId) {
        throw new Error('no contentid');
    }
    return async (
        dispatch: ThunkDispatch<null, null, LoadPlayerContentActions>
    ) => {
        dispatch({
            payload: { contentId },
            type: H5P_LOADPLAYERCONTENT_REQUEST
        });

        const content = JSON.parse(
            (await h5pApi.loadPlayerContent(contentId)).text
        );

        dispatch({
            payload: { contentId, content },
            type: H5P_LOADPLAYERCONTENT_SUCCESS
        });

        return content;
    };
}

export function deleteH5P(
    contentId: ContentId
): ThunkAction<void, null, null, DeleteActions> {
    return (dispatch: ThunkDispatch<null, null, DeleteActions>) => {
        dispatch({
            payload: { contentId },
            type: H5P_DELETE_REQUEST
        });

        return h5pApi
            .deleteH5P(contentId)
            .then((response) => {
                return dispatch({
                    payload: { contentId },
                    type: H5P_DELETE_SUCCESS
                });
            })
            .catch((error) => {
                Sentry.captureException(error);

                return dispatch({
                    error,
                    payload: { contentId },
                    type: H5P_DELETE_ERROR
                });
            });
    };
}

export function save(
    fileHandleId?: string
): ThunkAction<void, null, null, SaveActions> {
    return async (dispatch: any) => {
        try {
            const data = await dispatch(updateContentOnServer());

            dispatch({
                payload: { id: data.contentId },
                type: H5PEDITOR_SAVE_REQUEST
            });

            const response = await filesApi.exportH5P(
                data.contentId,
                fileHandleId
            );

            if (response.status !== 200) {
                throw new Error(`Error while saving H5P: ${response.text}`);
            }

            try {
                dispatch(track('H5P', 'save', data.metadata?.mainLibrary));
            } catch (error: any) {
                Sentry.captureException(error);
            }

            return dispatch({
                payload: {
                    id: data.contentId,
                    fileHandleId: response.body.fileHandleId,
                    path: response.body.path
                },
                type: H5PEDITOR_SAVE_SUCCESS
            });
        } catch (error: any) {
            if (error.status === 499) {
                return dispatch({
                    payload: {},
                    type: H5PEDITOR_SAVE_CANCEL
                });
            } else {
                Sentry.captureException(error);

                return dispatch({
                    error,
                    payload: { fileHandleId },
                    type: H5PEDITOR_SAVE_ERROR
                });
            }
        }
    };
}

export function importH5P(
    fileHandleId: string,
    path: string,
    history?: H.History
): ThunkAction<void, null, null, SaveActions> {
    return (dispatch: any) => {
        const tabId = shortid();

        dispatch({
            payload: { tabId, fileHandleId, path },
            type: H5P_IMPORT_REQUEST
        });

        if (history) {
            history.push('/h5peditor');
        }

        return filesApi
            .importH5P(fileHandleId)
            .then(({ body }) => {
                try {
                    dispatch(track('H5P', 'open', body.metadata.mainLibrary));
                } catch (error: any) {
                    Sentry.captureException(error);
                }

                dispatch({
                    payload: {
                        tabId,
                        fileHandleId,
                        path,
                        h5p: body
                    },
                    type: H5P_IMPORT_SUCCESS
                });
            })
            .catch((error: Error) => {
                Sentry.captureException(error);

                dispatch({
                    error,
                    payload: {
                        fileHandleId
                    },
                    type: H5P_IMPORT_ERROR
                });
            });
    };
}
