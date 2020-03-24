import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import * as Core from './editor';

import * as FS from 'state/fs';
import * as Notifications from 'state/notifications';
import * as Run from 'state/run';
import * as Tabs from 'state/tabs';
import * as UI from 'state/ui';

// state - reducer
const rootReducer = (history: any) =>
    combineReducers({
        notifications: Notifications.reducer,
        tabs: Tabs.reducer,
        ui: UI.reducer,
        // tslint:disable-next-line: object-literal-sort-keys
        fs: FS.reducer,
        // tslint:disable-next-line: object-literal-sort-keys
        run: Run.reducer,
        router: connectRouter(history)
    });

export interface IState extends FS.types.IState, Run.types.IState {
    notifications: Notifications.types.INotificationsState;
    router: {
        location: {
            hash: string;
            key: string;
            pathname: string;
            search: string;
        };
    };
    tabs: Tabs.types.ITabState;
    ui: UI.types.IUIState;
}

export const actions = {
    core: Core.actions,
    fileTree: FS.actions,
    notifications: Notifications.actions,
    run: Run.actions,
    tabs: Tabs.actions,
    ui: UI.actions
};

export const selectors = {
    fileTree: FS.selectors,
    notifications: Notifications.selectors,
    run: Run.selectors,
    tabs: Tabs.selectors,
    ui: UI.selectors
};

export default rootReducer;
