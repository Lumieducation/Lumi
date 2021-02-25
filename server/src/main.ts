import * as Sentry from '@sentry/electron';
import electron from 'electron';
import log from 'electron-log';
import os from 'os';
import path from 'path';
import SocketIO from 'socket.io';
import { URL } from 'url';
import httpServerFactory from './httpServer';
import updateMenu from './menu';
import updater from './updater';
import websocketFactory from './websocket';
import serverConfigFactory from './serverConfig';
import fsExtra from 'fs-extra';

const app = electron.app;
let websocket: SocketIO.Server;
let mainWindow: electron.BrowserWindow;
let port: number;
const isDevelopment = process.env.NODE_ENV === 'development';
const BrowserWindow = electron.BrowserWindow;

const serverConfig = serverConfigFactory(
    process.env.USERDATA || app.getPath('userData')
);
Sentry.init({
    dsn: 'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
    release: app.getVersion(),
    environment: process.env.NODE_ENV,
    beforeSend: async (event: Sentry.Event) => {
        if (await fsExtra.readJSON(serverConfig.settingsFile)) {
            return event;
        }
        return null;
    }
});

process.on('uncaughtException', (error) => {
    Sentry.captureException(error);
    log.error(error);
});

function createMainWindow(
    websocketArg: SocketIO.Server
): electron.BrowserWindow {
    const window = new BrowserWindow({
        height: 800,
        minHeight: 600,
        minWidth: 500,
        width: 1000
    });

    window.webContents.on('did-navigate-in-page', (event, url) => {
        updateMenu(new URL(url).pathname, window, websocketArg);
    });

    updateMenu('/', window, websocketArg);

    if (isDevelopment) {
        window.webContents.openDevTools();
        if (process.env.REDUX_EXTENSION) {
            BrowserWindow.addDevToolsExtension(
                path.join(
                    os.homedir(),
                    `/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0`
                )
            );
        }
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
        mainWindow = createMainWindow(websocket);
    }
});

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
    log.info('app is ready');
    const server = await httpServerFactory(
        serverConfigFactory(process.env.USERDATA || app.getPath('userData')),
        mainWindow
    );
    log.info('server booted');

    port = (server.address() as any).port;
    log.info(`port is ${port}`);

    websocket = websocketFactory(server);
    log.info('websocket created');

    updater(app, websocket, serverConfig);
    log.info('updater started');

    mainWindow = createMainWindow(websocket);
    log.info('window created');
});
