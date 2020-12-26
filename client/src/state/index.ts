import { combineReducers, applyMiddleware, compose, createStore } from 'redux';

import {
    loadTranslations,
    setLocale,
    syncTranslationWithStore,
    i18nReducer
} from 'react-redux-i18n';

import translations from '../i18n';

import * as Notifications from './Notifications';
import * as H5PEditor from './H5PEditor';
import * as H5P from './h5p';

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
        notifications: Notifications.reducer,
        h5peditor: H5PEditor.reducer,
        i18n: i18nReducer
    });

const store = createStore(
    rootReducer(),
    persistentState,
    composeEnhancers(applyMiddleware(...middleWares))
);

export interface IState {
    notifications: Notifications.types.INotificationsState;
    h5peditor: H5PEditor.types.IH5PEditorState;
}

export const actions = {
    notifications: Notifications.actions,
    h5p: H5P.actions,
    h5peditor: H5PEditor.actions
};

export const selectors = {
    notifications: Notifications.selectors,
    h5peditor: H5PEditor.selectors
};

syncTranslationWithStore(store);
store.dispatch(loadTranslations(translations));
store.dispatch(setLocale('en'));
export default store;
