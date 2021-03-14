import Sentry from './Sentry';

import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';

import { SnackbarProvider } from 'notistack';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import theme from '../theme';

import { default as store } from '../state';
import App from '../views/App';
import LoadingScreen from '../views/components/LoadingScreen';

import './i18n';

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
                <SnackbarProvider
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    maxSnack={3}
                >
                    <Suspense fallback={<LoadingScreen />}>
                        <App />
                    </Suspense>
                </SnackbarProvider>
            </ThemeProvider>
            {/* </ConnectedRouter> */}
        </Provider>,
        document.querySelector('#root')
    );
}

export default boot;
