import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import * as notifications from '../Notifications/NotificationsActions';

import Logger from '../../helpers/Logger';

import {
    ContentId,
    ITab,
    TabActionTypes,
    H5PEDITOR_CLOSE_TAB,
    H5PEDITOR_OPEN_TAB,
    H5PEDITOR_SELECT_TAB,
    H5PEDITOR_UPDATE_TAB,
    H5PEDITOR_LOADED,
    H5PEDITOR_SAVED,
    H5PPLAYER_INITIALIZED,
    H5PEDITOR_SAVED_ERROR,
    DeleteActions,
    LoadPlayerContentActions,
    LoadEditorContentActions,
    SaveContentActions,
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
    H5PEDITOR_SAVE_CANCEL
} from './H5PEditorTypes';

import _path from 'path';
import upath from 'upath';

import { track } from '../track/actions';
import * as selectors from './H5PEditorSelectors';
import shortid from 'shortid';

import store from '../index';

import * as api from './H5PApi';

const log = new Logger('actions:tabs');

declare var window: {
    h5peditor: any;
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

export function editorSaveError(tabId: string): any {
    return {
        payload: { tabId },
        type: H5PEDITOR_SAVED_ERROR
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

export function exportH5P(): any {
    return async (dispatch: any) => {
        try {
            const data = await window.h5peditor.current?.save(); // this dispatches updateContent()
            dispatch({
                payload: { contentId: data.contentId },
                type: H5PEDITOR_EXPORT_REQUEST
            });

            try {
                await api.exportAsHtml(data.contentId);

                dispatch({
                    payload: { contentId: data.contentId },
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
                    dispatch({
                        payload: { error, contentId: data.contentId },
                        type: H5PEDITOR_EXPORT_ERROR
                    });
                }
            }
        } catch (error) {
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
        api.openFiles().then((response) => {
            const files = response.body;

            files.forEach((file: string) => {
                dispatch(
                    clickOnFileInFiletree(
                        _path.basename(upath.normalize(file)),
                        file
                    )
                );
            });
        });
        return dispatch;
    };
}

export function clickOnFileInFiletree(name: string, path: string): any {
    return async (dispatch: any) => {
        track('file_tree', 'click', 'import');
        try {
            const importAction = await dispatch(importH5P(path));

            if (importAction.error) {
                dispatch(
                    notifications.notify(
                        `h5p-import-error: ${importAction.error.response.body.message}`,
                        'error'
                    )
                );
            } else {
                const h5p = importAction.payload.h5p;
                dispatch(
                    openTab({
                        name,
                        path,
                        contentId: h5p.id
                    })
                );
            }
        } catch (error) {
            dispatch(notifications.notify('fatal-error', 'error'));
        }
    };
}

export function openTab(tab?: Partial<ITab>): TabActionTypes {
    log.info(`opening tab`);
    return {
        payload: {
            id: shortid(),
            tab
        },
        type: H5PEDITOR_OPEN_TAB
    };
}

export function closeTab(id: string): any {
    log.info(`closing tab with id ${id}`);
    return async (dispatch: any) => {
        const tab = selectors.tab(store.getState(), id);

        if (tab && tab.contentId) {
            dispatch(deleteH5P(tab.contentId));
        }

        dispatch({
            payload: { id },
            type: H5PEDITOR_CLOSE_TAB
        });
    };
}

export function selectTab(value: number): TabActionTypes {
    log.info(`selecting tab ${value}`);
    return {
        payload: { value },
        type: H5PEDITOR_SELECT_TAB
    };
}

export function updateTab(
    tabId: string,
    update: Partial<ITab>
): TabActionTypes {
    return {
        payload: { tabId, update },
        type: H5PEDITOR_UPDATE_TAB
    };
}

export function updateContent(
    tabId: string,
    contentId: string,
    requestBody: { library: string; params: any }
): ThunkAction<void, null, null, SaveContentActions> {
    return async (dispatch: ThunkDispatch<null, null, SaveContentActions>) => {
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
                return dispatch({
                    error,
                    payload: { contentId },
                    type: H5P_DELETE_ERROR
                });
            });
    };
}

export function save(
    contentId: ContentId,
    path?: string
): ThunkAction<void, null, null, SaveActions> {
    return async (dispatch: any) => {
        dispatch({
            payload: { id: contentId, path },
            type: H5PEDITOR_SAVE_REQUEST
        });

        try {
            const response = await api.exportH5P(contentId, path);

            dispatch({
                // tslint:disable-next-line: object-shorthand-properties-first
                payload: { id: contentId, ...response.body },
                type: H5PEDITOR_SAVE_SUCCESS
            });
        } catch (error) {
            if (error.status === 499) {
                dispatch({
                    payload: {},
                    type: H5PEDITOR_SAVE_CANCEL
                });
            } else {
                dispatch({
                    error,
                    payload: { id: contentId, path },
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
        dispatch({
            payload: { path },
            type: H5P_IMPORT_REQUEST
        });

        return api
            .importH5P(path)
            .then(({ body }) =>
                dispatch({
                    payload: { path, h5p: body },
                    type: H5P_IMPORT_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: {
                        path
                    },
                    type: H5P_IMPORT_ERROR
                })
            );
    };
}
