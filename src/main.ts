/* eslint-disable import/first */
import log from 'electron-log';

import * as Sentry from '@sentry/electron';
import * as SentryNode from '@sentry/node';

import info from './info';

import nucleus from 'nucleus-nodejs';

import electron from 'electron';

const app = electron.app;
process.env.USERDATA = process.env.USERDATA || `${app.getPath('userData')}`;

import os from 'os';
import path from 'path';
import update from './updater';

import boot from './server/boot';

import menuTemplate from './menu';

process.on('uncaughtException', error => {
    log.error(error);
});

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'https://02e4da31636d479f86a17a6ef749278c@sentry.io/1876151',
        release: info.version
    });
    SentryNode.init({
        dsn: 'https://02e4da31636d479f86a17a6ef749278c@sentry.io/1876151',
        release: info.version
    });
}

if (process.env.NODE_ENV !== 'development') {
    nucleus.init('5e284c9a73aa9c0115e0d1d6');
    nucleus.appStarted();
    nucleus.setProps(
        {
            version: info.version
        },
        false
    );
}

const BrowserWindow = electron.BrowserWindow;

let mainWindow;
let port: number;

const isDevelopment = process.env.NODE_ENV === 'development';

async function createMainWindow(): Promise<electron.BrowserWindow> {
    const window = new BrowserWindow({
        height: 800,
        minHeight: 600,
        minWidth: 500,
        width: 1000
    });

    const menu = electron.Menu.buildFromTemplate(menuTemplate(window));
    electron.Menu.setApplicationMenu(menu);

    if (isDevelopment) {
        window.webContents.openDevTools();
        BrowserWindow.addDevToolsExtension(
            path.join(
                os.homedir(),
                `/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0`
            )
        );
        window.loadURL('http://localhost:3000');
    } else {
        window.loadURL(`http://localhost:${port}`);
    }

    window.on('closed', () => {
        mainWindow = null;
    });

    window.webContents.on('devtools-opened', () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    window.webContents.on('will-navigate', (e, url) => {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });

    return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow();
    }
});

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
    log.info('app is ready');

    const server = await boot();

    log.info('server booted');

    port = (server.address() as any).port;

    log.info(`port is ${port}`);

    mainWindow = await createMainWindow();
    log.info('window created');

    setTimeout(() => {
        update(app);
    }, 5000);
});
