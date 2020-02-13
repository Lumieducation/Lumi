import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import * as Sentry from '@sentry/browser';
import createSentryMiddleware from 'redux-sentry-middleware';

import rootReducer from '../';

import Logger from '../../helpers/Logger';
const log = new Logger('store');

declare var window: any;

const persistentState = undefined;

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createBrowserHistory();

log.info(`initializing store`);

const middleWares = [thunk, createSentryMiddleware(Sentry)];

if (process.env.NODE_ENV === 'development' && window.localStorage.logActions) {
    middleWares.push(logger as any);
}

const store = createStore(
    rootReducer(history),
    persistentState,
    composeEnhancers(applyMiddleware(...middleWares))
);

export default store;
