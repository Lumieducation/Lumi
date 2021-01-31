import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';

import React from 'react';
import ReactDOM from 'react-dom';

import theme from './theme';

import App from './App';

declare var window: any;

window.lumi_xapi = window.lumi_xapi || [];
if (window.H5P) {
    window.H5P.externalDispatcher.on('xAPI', (event: any) => {
        window.lumi_xapi.push({
            ...event.data.statement,
            timeStamp: new Date().getTime()
        });
    });
}

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>,
    document.querySelector('#root')
);
