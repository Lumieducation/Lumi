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
    H5PEDITOR_SAVE_ERROR,
    DeleteActions,
    LoadPlayerContentActions,
    LoadEditorContentActions,
    SaveContentActions,
    ExportActions,
    H5P_DELETE_ERROR,
    H5P_DELETE_REQUEST,
    H5P_DELETE_SUCCESS,
    H5P_EXPORT_ERROR,
    H5P_EXPORT_REQUEST,
    H5P_EXPORT_SUCCESS,
    H5P_IMPORT_ERROR,
    H5P_IMPORT_REQUEST,
    H5P_IMPORT_SUCCESS,
    H5P_UPDATE_ERROR,
    H5P_UPDATE_REQUEST,
    H5P_UPDATE_SUCCESS,
    H5P_LOADPLAYERCONTENT_REQUEST,
    H5P_LOADPLAYERCONTENT_SUCCESS,
    H5P_SAVECONTENT_REQUEST,
    H5P_SAVECONTENT_SUCCESS,
    H5P_SAVECONTENT_ERROR,
    H5P_LOADEDITORCONTENT_REQUEST,
    H5P_LOADEDITORCONTENT_SUCCESS
} from './H5PEditorTypes';

import superagent from 'superagent';
import _path from 'path';
import upath from 'upath';

import { track } from '../track/actions';
import { IState } from '..';
import * as selectors from './H5PEditorSelectors';
import shortid from 'shortid';

import store from '../index';

import * as api from './H5PApi';

const log = new Logger('actions:tabs');

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
        type: H5PEDITOR_SAVE_ERROR
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

export function openH5P(): any {
    return (dispatch: any) => {
        superagent.get('/api/v1/h5p/open_files').then((response) => {
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

export function clickOnCloseTab(tabId: string): any {
    return async (dispatch: any, getState: () => IState) => {
        track('tabs', 'click', 'close');
        dispatch(
            updateTab(tabId, {
                loadingIndicator: true,
                state: 'closing'
            })
        );
        const contentId = selectors.tab(getState(), tabId).contentId;

        if (contentId) {
            await dispatch(deleteH5P(contentId));
        }

        dispatch(closeTab(tabId));
    };
}

export function clickOnCreateH5P(): any {
    return async (dispatch: any) => {
        dispatch(openTab());
        // dispatch(
        //     updateTab(tab.id, {
        //         mode: Modes.edit,
        //         loadingIndicator: false
        //     })
        // );
    };
}

export function clickOnFileInFiletree(name: string, path: string): any {
    return async (dispatch: any) => {
        // const tab = new Tab(name, path);

        track('file_tree', 'click', 'import');

        // dispatch(openTab(tab));

        try {
            const importAction = await dispatch(importH5P(path));

            if (importAction.error) {
                dispatch(
                    notifications.notify(
                        `h5p-import-error: ${importAction.error.response.body.message}`,
                        'error'
                    )
                );
                // dispatch(
                //     updateTab(tab.id, {
                //         loadingIndicator: false,
                //         state: 'error'
                //     })
                // );
            } else {
                const h5p = importAction.payload.h5p;
                // dispatch(
                //     updateTab(tab.id, {
                //         contentId: h5p.id,
                //         loadingIndicator: false,
                //         state: 'success',

                //         mainLibrary: h5p.library.split(' ')[0]
                //     })
                // );
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
            // dispatch(
            //     updateTab(tab.id, {
            //         loadingIndicator: false,
            //         state: 'error'
            //     })
            // );
        }
    };
}

export function clickOnSaveButton(
    tabId: string,
    params: any,
    library: string,
    contentId?: ContentId,
    path?: string
): any {
    return async (dispatch: any) => {
        track('save_button', 'click');

        dispatch(
            updateTab(tabId, {
                state: 'saving'
            })
        );

        const updateAction = await dispatch(
            updateH5P(params.params, params.metadata, library, contentId)
        );

        if (updateAction.error) {
            dispatch(
                updateTab(tabId, {
                    state: 'savingError'
                })
            );
            dispatch(notifications.notify(`h5p-update-error`, 'error'));
            return dispatch;
        }

        const updatedH5P = updateAction.payload;

        const exportAction = await dispatch(exportH5P(updatedH5P.id, path));

        if (exportAction.error) {
            if (exportAction.error.response.body.code === 'user-abort') {
                dispatch(
                    updateTab(tabId, {
                        state: 'success'
                    })
                );
                return dispatch;
            }
            dispatch(
                updateTab(tabId, {
                    state: 'savingError'
                })
            );
            dispatch(notifications.notify(`h5p-export-error`, 'error'));
            setTimeout(() => {
                dispatch(
                    updateTab(tabId, {
                        state: 'success'
                    })
                );
            }, 2500);
            return dispatch;
        }

        dispatch(
            updateTab(tabId, {
                mainLibrary: library.split(' ')[0],
                name: _path.basename(
                    upath.normalize(exportAction.payload.path)
                ),
                path: exportAction.payload.path,
                state: 'savingSuccess'
            })
        );

        setTimeout(() => {
            dispatch(
                updateTab(tabId, {
                    state: 'success'
                })
            );
        }, 2500);
        dispatch(notifications.notify(`h5p-export-success`, 'success'));
    };
}

export function updateH5PInTab(
    tabId: string,
    params: any,
    library: string,
    contentId?: ContentId
): any {
    return async (dispatch: any) => {
        if (!params || !params.params || !params.metadata) {
            return;
        }

        const updateAction = await dispatch(
            updateH5P(params.params, params.metadata, library, contentId)
        );

        if (updateAction.error) {
            dispatch(notifications.notify(`h5p-update-error`, 'error'));
            return dispatch;
        }

        return dispatch(
            updateTab(tabId, {
                contentId: updateAction.payload.id,
                mainLibrary: updateAction.payload.library.split(' ')[0]
            })
        );
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

export function saveContent(
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
            type: H5P_SAVECONTENT_REQUEST
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
                    type: H5P_SAVECONTENT_SUCCESS
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
                type: H5P_SAVECONTENT_SUCCESS
            });

            return response;
        } catch (error) {
            dispatch({
                payload: {
                    tabId
                },
                type: H5P_SAVECONTENT_ERROR
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

export function exportH5P(
    contentId: ContentId,
    path?: string
): ThunkAction<void, null, null, ExportActions> {
    return (dispatch: any) => {
        dispatch({
            payload: { id: contentId, path },
            type: H5P_EXPORT_REQUEST
        });

        return api
            .exportH5P(contentId, path)
            .then(({ body }) =>
                dispatch({
                    // tslint:disable-next-line: object-shorthand-properties-first
                    payload: { id: contentId, ...body },
                    type: H5P_EXPORT_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: { id: contentId, path },
                    type: H5P_EXPORT_ERROR
                })
            );
    };
}

export function importH5P(
    path: string
): ThunkAction<void, null, null, ExportActions> {
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

export function updateH5P(
    parameters: any,
    metadata: any,
    library: string,
    id?: ContentId
): any {
    return (dispatch: any) => {
        dispatch({
            payload: { parameters, metadata, library, id },
            type: H5P_UPDATE_REQUEST
        });

        return api
            .updateH5P(
                {
                    id,
                    library,
                    metadata,
                    parameters
                },
                id
            )
            .then(({ body }) =>
                dispatch({
                    payload: { ...body },
                    type: H5P_UPDATE_SUCCESS
                })
            )
            .catch((error: Error) =>
                dispatch({
                    error,
                    payload: {
                        id,
                        library,
                        metadata,
                        parameters
                    },
                    type: H5P_UPDATE_ERROR
                })
            );
    };
}
