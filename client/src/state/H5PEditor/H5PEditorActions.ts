import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import * as Sentry from '@sentry/browser';
import Logger from '../../helpers/Logger';

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

import * as api from './H5PApi';

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

export function exportH5P(
    includeReporter: boolean,
    format: 'bundle' | 'external' | 'scorm'
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
                await api.exportAsHtml(data.contentId, includeReporter, format);

                // TOOD: chang tracking
                dispatch(
                    track(
                        'H5P',
                        'export_as_single_html',
                        `${
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
            } catch (error) {
                if (error.status === 499) {
                    // dispatched if the user cancel the system's save dialog.
                    dispatch({
                        payload: {
                            contentId: data.contentId
                        },
                        type: H5PEDITOR_EXPORT_CANCEL
                    });
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
        } catch (error) {
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
        api.openFiles()
            .then((response) => {
                const files = response.body;

                files.forEach((file: string) => {
                    dispatch(importH5P(file));
                });
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
                tab?.path ? 'existing h5p' : 'new h5p'
            )
        );

        dispatch({
            payload: {
                id: shortid(),
                tab
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
        } catch (error) {
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
                    (await api.saveContent(contentId, requestBody)).text
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
                (await api.createContent(requestBody)).text
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
        } catch (error) {
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
                (await api.loadEditorContent(contentId)).text
            );

            dispatch({
                payload: { contentId, tabId, content },
                type: H5P_LOADEDITORCONTENT_SUCCESS
            });

            return content;
        } catch (error) {
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
            (await api.loadPlayerContent(contentId)).text
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

        return api
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
    path?: string
): ThunkAction<void, null, null, SaveActions> {
    return async (dispatch: any) => {
        try {
            const data = await dispatch(updateContentOnServer());

            dispatch({
                payload: { id: data.contentId, path },
                type: H5PEDITOR_SAVE_REQUEST
            });

            const response = await api.exportH5P(data.contentId, path);

            if (response.status !== 200) {
                throw new Error(`Error while saving H5P: ${response.text}`);
            }

            try {
                dispatch(track('H5P', 'save', data.metadata?.mainLibrary));
            } catch (error) {
                Sentry.captureException(error);
            }

            dispatch({
                // tslint:disable-next-line: object-shorthand-properties-first
                payload: { id: data.contentId, ...response.body },
                type: H5PEDITOR_SAVE_SUCCESS
            });
        } catch (error) {
            if (error.status === 499) {
                dispatch({
                    payload: {},
                    type: H5PEDITOR_SAVE_CANCEL
                });
            } else {
                Sentry.captureException(error);

                dispatch({
                    error,
                    payload: { path },
                    type: H5PEDITOR_SAVE_ERROR
                });
            }
        }
    };
}

export function importH5P(
    path: string
): ThunkAction<void, null, null, SaveActions> {
    return (dispatch: any) => {
        const tabId = shortid();

        dispatch({
            payload: { tabId, path },
            type: H5P_IMPORT_REQUEST
        });

        return api
            .importH5P(path)
            .then(({ body }) => {
                try {
                    dispatch(track('H5P', 'open', body.metadata.mainLibrary));
                } catch (error) {
                    Sentry.captureException(error);
                }

                dispatch({
                    payload: { tabId, path, h5p: body },
                    type: H5P_IMPORT_SUCCESS
                });
            })
            .catch((error: Error) => {
                Sentry.captureException(error);

                dispatch({
                    error,
                    payload: {
                        path
                    },
                    type: H5P_IMPORT_ERROR
                });
            });
    };
}
