import * as H5P from '../h5p';
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
    H5PEDITOR_SAVE_ERROR
} from './H5PEditorTypes';

import superagent from 'superagent';
import _path from 'path';
import upath from 'upath';

import { track } from '../track/actions';
import { IState } from '..';
import * as selectors from './H5PEditorSelectors';
import * as h5pActions from '../h5p/H5PActions';
import shortid from 'shortid';

import store from '../index';

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
            await dispatch(H5P.actions.deleteH5P(contentId));
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
            const importAction = await dispatch(H5P.actions.importH5P(path));

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
            H5P.actions.updateH5P(
                params.params,
                params.metadata,
                library,
                contentId
            )
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

        const exportAction = await dispatch(
            H5P.actions.exportH5P(updatedH5P.id, path)
        );

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
            H5P.actions.updateH5P(
                params.params,
                params.metadata,
                library,
                contentId
            )
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
            dispatch(h5pActions.deleteH5P(tab.contentId));
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
