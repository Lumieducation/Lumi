import Sentry from './Sentry';

import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';

// import { hot } from 'react-hot-loader/root';

// import { ConnectedRouter } from 'connected-react-router';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import theme from '../theme';

import { default as store } from '../state';
import App from '../views/App';

const log = new Logger('root');

log.info(`booting v${process.env.VERSION}`);
Sentry.captureMessage('start');

declare var window: any;

window.editor = {};

function boot() {
    ReactDOM.render(
        <Provider store={store}>
            {/* <ConnectedRouter history={history}> */}
            <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <App />
            </ThemeProvider>
            {/* </ConnectedRouter> */}
        </Provider>,
        document.querySelector('#root')
    );
}

export default boot;
