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
import matomo from './matomo';
import { machineId } from 'node-machine-id';
import i18next from 'i18next';
import fsExtra from 'fs-extra';

import settingsCache from './settingsCache';
import electronState from './electronState';
import DelayedEmitter from './helpers/DelayedEmitter';

const app = electron.app;
let websocket: SocketIO.Server;
const tmpDir = process.env.TEMPDATA || path.join(app.getPath('temp'), 'lumi');

/**
 * The DelayedEmitter queues websocket events until the websocket is connected.
 * We need it as the browser window and the client must be initialized before
 * we can send events, but the events are raised by the startup routine before
 * the initialization is over.
 */
const delayedWebsocketEmitter: DelayedEmitter = new DelayedEmitter();
let mainWindow: electron.BrowserWindow;
let port: number;
let currentPath: string = '/';
const isDevelopment = process.env.NODE_ENV === 'development';
const BrowserWindow = electron.BrowserWindow;

export function createMainWindow(websocketArg: SocketIO.Server): void {
    if (!mainWindow) {
        const window = new BrowserWindow({
            height: 800,
            minHeight: 600,
            minWidth: 500,
            width: 1000
        });

        window.webContents.on('did-navigate-in-page', (event, url) => {
            currentPath = new URL(url).pathname;
            updateMenu(currentPath, window, websocketArg);
        });

        i18next.on('languageChanged', (lng) => {
            updateMenu(currentPath, window, websocketArg);
        });

        updateMenu('/', window, websocketArg);

        if (isDevelopment) {
            window.webContents.openDevTools();
            if (process.env.REDUX_EXTENSION) {
                const ses = window.webContents.session;

                ses.loadExtension(
                    path.join(
                        os.homedir(),
                        `/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.1_0`
                    )
                );
            }
            window.loadURL('http://localhost:3000');
        } else {
            window.loadURL(`http://localhost:${port}`);
        }

        window.on('closed', () => {
            mainWindow = null;
            // If a new main window is recreated later (macOS), we need to
            // listen to the websocket's connection event again.
            delayedWebsocketEmitter.resetWebsocketConnection();
        });

        window.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            electron.shell.openExternal(url);
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

        window.webContents.on('before-input-event', (event, input) => {
            if (electronState.getState().blockKeyboard) {
                event.preventDefault();
            }
        });

        mainWindow = window;
    }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
    app.quit();
} else {
    const serverConfig = serverConfigFactory(
        process.env.USERDATA || app.getPath('userData'),
        tmpDir
    );
    Sentry.init({
        dsn: 'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
        release: app.getVersion(),
        environment: process.env.NODE_ENV,
        beforeSend: async (event: Sentry.Event) => {
            if (settingsCache.getSettings().bugTracking) {
                return event;
            }
            return null;
        }
    });

    process.on('uncaughtException', (error) => {
        Sentry.captureException(error);
        log.error(error);
    });

    app.on('second-instance', (event, argv) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();

            if (argv.length >= 2) {
                // Check if there are H5Ps specified in the command line args and
                // load them (Windows only).
                argv.splice(0, 1);
                const openFilePaths = argv.filter((arg) =>
                    arg.endsWith('.h5p')
                );
                if (openFilePaths.length > 0) {
                    log.debug(`Opening file(s): ${openFilePaths.join(' ')}`);
                    delayedWebsocketEmitter.emit('action', {
                        payload: {
                            paths: openFilePaths
                        },
                        type: 'OPEN_H5P'
                    });
                }
            }
        }
    });

    // quit application when all windows are closed
    app.on('window-all-closed', () => {
        // on macOS it is common for applications to stay open until the user explicitly quits
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    // Handle open file events for MacOS
    app.on('open-file', (event: electron.Event, openedFilePath: string) => {
        log.debug('Electron open-file event caught');

        /**
         * If we are in macOS and the process is still active but there is no
         * window, we need to create one.
         */
        if (mainWindow === null) {
            createMainWindow(websocket);
        }

        delayedWebsocketEmitter.emit('action', {
            payload: {
                paths: [openedFilePath]
            },
            type: 'OPEN_H5P'
        });

        event.preventDefault();
    });

    app.on('activate', () => {
        // on macOS it is common to re-create a window even after all windows have been closed
        if (mainWindow === null) {
            createMainWindow(websocket);
        }
    });

    app.on('before-quit', async () => {
        try {
            if (settingsCache.getSettings().usageStatistics) {
                const data = {
                    url: '/Lumi',
                    _id: await machineId(),
                    uid: await machineId(),
                    e_c: 'App',
                    e_a: 'quit',
                    lang: electron.app.getLocale(),
                    ua: os.type()
                };
                matomo.track(data);
            }
        } catch (error) {
            Sentry.captureException(error);
        }
    });

    app.on('will-quit', (event) => {
        log.debug(`Deleting temporary directory: ${tmpDir}`);
        fsExtra.removeSync(tmpDir);
    });

    // create main BrowserWindow when electron is ready
    app.on('ready', async () => {
        log.info('app is ready');
        const server = await httpServerFactory(serverConfig, mainWindow, {
            devMode: app.commandLine.hasSwitch('dev'),
            libraryDir:
                app.commandLine.getSwitchValue('libs') !== ''
                    ? app.commandLine.getSwitchValue('libs')
                    : undefined
        });
        log.info('server booted');

        port = (server.address() as any).port;
        log.info(`port is ${port}`);

        websocket = websocketFactory(server);
        log.info('websocket created');

        delayedWebsocketEmitter.setWebsocket(websocket);

        updater(app, websocket, serverConfig);
        log.info('updater started');

        createMainWindow(websocket);
        log.info('window created');

        const argv = process.argv;
        if (process.platform === 'win32' && argv.length >= 2) {
            // Check if there are H5Ps specified in the command line args and
            // load them (Windows only).
            argv.splice(0, 1);
            const openFilePaths = argv.filter((arg) => arg.endsWith('.h5p'));
            if (openFilePaths.length > 0) {
                log.debug(`Opening file(s): ${openFilePaths.join(' ')}`);
                delayedWebsocketEmitter.emit('action', {
                    payload: {
                        paths: openFilePaths
                    },
                    type: 'OPEN_H5P'
                });
            }
        }

        try {
            if (settingsCache.getSettings().usageStatistics) {
                const data = {
                    url: '/Lumi',
                    _id: await machineId(),
                    uid: await machineId(),
                    e_c: 'App',
                    e_a: 'start',
                    lang: electron.app.getLocale(),
                    ua: os.type()
                };
                matomo.track(data);
            }
        } catch (error) {
            Sentry.captureException(error);
        }
    });
}
