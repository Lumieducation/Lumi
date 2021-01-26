import { combineReducers, applyMiddleware, compose, createStore } from 'redux';

import {
    loadTranslations,
    setLocale,
    syncTranslationWithStore,
    i18nReducer
} from 'react-redux-i18n';

import translations from '../i18n';

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

import thunk from 'redux-thunk';

import Logger from '../helpers/Logger';
const log = new Logger('store');

declare var window: any;

const persistentState = undefined;

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

log.info(`initializing store`);

const middleWares = [thunk /*createSentryMiddleware(Sentry)*/];

// state - reducer
const rootReducer = () =>
    combineReducers({
        notifications: NotificationsReducer,
        h5peditor: H5PEditorReducer,
        analytics: AnalyticsReducer,
        i18n: i18nReducer
    });

const store = createStore(
    rootReducer(),
    persistentState,
    composeEnhancers(applyMiddleware(...middleWares))
);

export interface IState
    extends H5PEditorTypes.IState,
        NotificationsTypes.IState,
        AnalyticsTypes.IState {}

export const actions = {
    notifications: NotificationsActions,
    h5peditor: H5PEditorActions,
    analytics: AnalyticsActions
};

export const selectors = {
    notifications: NotificationsSelectors,
    h5peditor: H5PEditorSelectors
};

syncTranslationWithStore(store);
store.dispatch(loadTranslations(translations) as any);
store.dispatch(setLocale('en') as any);
export default store;
