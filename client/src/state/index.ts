import { combineReducers, applyMiddleware, compose, createStore } from 'redux';
import * as Sentry from '@sentry/react';

import * as NotificationsActions from './Notifications/NotificationsActions';
import NotificationsReducer from './Notifications/NotificationsReducer';
import * as H5PEditorActions from './H5PEditor/H5PEditorActions';
import * as H5PEditorTypes from './H5PEditor/H5PEditorTypes';
import H5PEditorReducer from './H5PEditor/H5PEditorReducer';
import * as NotificationsSelectors from './Notifications/NotificationsSelectors';
import * as H5PEditorSelectors from './H5PEditor/H5PEditorSelectors';

import * as NotificationsTypes from './Notifications/NotificationsTypes';

import AnalyticsReducer from './Analytics/AnalyticsReducer';
import * as AnalyticsTypes from './Analytics/AnalyticsTypes';
import * as AnalyticsActions from './Analytics/AnalyticsActions';

import * as SettingsTypes from './Settings/SettingsTypes';
import SettingsReducer from './Settings/SettingsReducer';
import * as SettingsActions from './Settings/SettingsActions';

import * as SystemTypes from './System/SystemTypes';
import SystemReducer from './System/SystemReducer';
import * as SystemActions from './System/SystemActions';

import * as UpdatesTypes from './Updates/UpdatesTypes';
import UpdatesReducer from './Updates/UpdatesReducer';
import * as UpdatesActions from './Updates/UpdatesActions';

import RunReducer from './Run/RunReducer';
import * as RunTypes from './Run/RunTypes';
import * as RunActions from './Run/RunActions';
import thunk from 'redux-thunk';

import Logger from '../helpers/Logger';
const log = new Logger('store');

declare var window: any;

const persistentState = undefined;

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

log.info(`initializing store`);

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
    // Optionally pass options listed below
});

const middleWares = [thunk];

// state - reducer
const rootReducer = () =>
    combineReducers({
        notifications: NotificationsReducer,
        h5peditor: H5PEditorReducer,
        analytics: AnalyticsReducer,
        run: RunReducer,
        settings: SettingsReducer,
        system: SystemReducer,
        updates: UpdatesReducer
    });

const store = createStore(
    rootReducer(),
    persistentState,
    composeEnhancers(applyMiddleware(...middleWares), sentryReduxEnhancer)
);

export interface IState
    extends H5PEditorTypes.IState,
        NotificationsTypes.IState,
        AnalyticsTypes.IState,
        SettingsTypes.IState,
        RunTypes.IState,
        SystemTypes.IState,
        UpdatesTypes.IState {}

export const actions = {
    notifications: NotificationsActions,
    h5peditor: H5PEditorActions,
    analytics: AnalyticsActions,
    settings: SettingsActions,
    run: RunActions,
    system: SystemActions,
    updates: UpdatesActions
};

export const selectors = {
    notifications: NotificationsSelectors,
    h5peditor: H5PEditorSelectors
};

export default store;
