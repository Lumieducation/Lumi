import * as H5P from 'state/h5p';
import * as notifications from 'state/notifications/actions';
import * as tabs from 'state/tabs/actions';
import * as UI from 'state/ui/actions';

import superagent from 'superagent';
import _path from 'path';
import upath from 'upath';

import { track } from 'state/track/actions';
import Tab from 'state/tabs/model';
import { ContentId } from 'state/h5p/types';
import { Modes } from 'state/ui/types';
import { IState, selectors } from '../';

export function openH5P(): any {
    return (dispatch: any) => {
        superagent.get('/api/lumi-h5p/v1/open_files').then((response) => {
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

export function closeTab(tabId: string): any {
    return async (dispatch: any, getState: () => IState) => {
        track('tabs', 'click', 'close');
        dispatch(
            tabs.updateTab(tabId, {
                loadingIndicator: true,
                state: 'closing'
            })
        );
        const contentId = selectors.tabs.tab(getState(), tabId).contentId;

        if (contentId) {
            await dispatch(H5P.actions.deleteH5P(contentId));
        }

        dispatch(tabs.closeTab(tabId));
    };
}

export function clickOnCreateH5P(): any {
    return async (dispatch: any) => {
        const tab = new Tab('new H5P');

        dispatch(UI.changeMode(Modes.edit));
        dispatch(tabs.openTab(tab));
        dispatch(
            tabs.updateTab(tab.id, {
                loadingIndicator: false
            })
        );
    };
}

export function clickOnFileInFiletree(name: string, path: string): any {
    return async (dispatch: any) => {
        const tab = new Tab(name, path);

        track('file_tree', 'click', 'import');

        dispatch(tabs.openTab(tab));

        try {
            const importAction = await dispatch(H5P.actions.importH5P(path));

            if (importAction.error) {
                dispatch(
                    notifications.notify(
                        `h5p-import-error: ${importAction.error.response.body.message}`,
                        'error'
                    )
                );
                dispatch(
                    tabs.updateTab(tab.id, {
                        loadingIndicator: false,
                        state: 'error'
                    })
                );
            } else {
                const h5p = importAction.payload.h5p;
                dispatch(
                    tabs.updateTab(tab.id, {
                        contentId: h5p.id,
                        loadingIndicator: false,
                        state: 'success',

                        mainLibrary: h5p.library.split(' ')[0]
                    })
                );
                dispatch(UI.openLeftDrawer());
            }
        } catch (error) {
            dispatch(notifications.notify('fatal-error', 'error'));
            dispatch(
                tabs.updateTab(tab.id, {
                    loadingIndicator: false,
                    state: 'error'
                })
            );
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
            tabs.updateTab(tabId, {
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
                tabs.updateTab(tabId, {
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
                    tabs.updateTab(tabId, {
                        state: 'success'
                    })
                );
                return dispatch;
            }
            dispatch(
                tabs.updateTab(tabId, {
                    state: 'savingError'
                })
            );
            dispatch(notifications.notify(`h5p-export-error`, 'error'));
            setTimeout(() => {
                dispatch(
                    tabs.updateTab(tabId, {
                        state: 'success'
                    })
                );
            }, 2500);
            return dispatch;
        }

        dispatch(
            tabs.updateTab(tabId, {
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
                tabs.updateTab(tabId, {
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
            tabs.updateTab(tabId, {
                contentId: updateAction.payload.id,
                mainLibrary: updateAction.payload.library.split(' ')[0]
            })
        );
    };
}
