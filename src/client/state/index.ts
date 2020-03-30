import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import * as Core from './editor';

import * as Notifications from 'state/notifications';
import * as Tabs from 'state/tabs';
import * as UI from 'state/ui';

// state - reducer
const rootReducer = (history: any) =>
    combineReducers({
        notifications: Notifications.reducer,
        tabs: Tabs.reducer,
        ui: UI.reducer,
        // tslint:disable-next-line: object-literal-sort-keys
        router: connectRouter(history)
    });

export interface IState {
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
    notifications: Notifications.actions,
    tabs: Tabs.actions,
    ui: UI.actions
};

export const selectors = {
    notifications: Notifications.selectors,
    tabs: Tabs.selectors,
    ui: UI.selectors
};

export default rootReducer;
