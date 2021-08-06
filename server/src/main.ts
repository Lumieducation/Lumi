/**
 * This file contains the Electron app initialization and is the main entry
 * point into the whole app. It initializes all other components and parses
 * command line arguments and other events received from the OS.
 */

import * as Sentry from '@sentry/electron';
import electron, { app } from 'electron';
import log from 'electron-log';
import os from 'os';
import path from 'path';
import SocketIO from 'socket.io';
import { URL } from 'url';
import createHttpServer from './boot/httpServer';
import initUpdater from './boot/updater';
import createWebsocket from './boot/websocket';
import serverConfigFactory from './config/defaultPaths';
import matomo from './boot/matomo';
import { machineId } from 'node-machine-id';
import i18next from 'i18next';
import fsExtra from 'fs-extra';

import updateMenu from './menu';
import SettingsCache from './config/SettingsCache';
import DelayedEmitter from './helpers/DelayedEmitter';
import createWindow from './boot/clientWindow';
import migrations from './boot/migrations';
import initI18n from './boot/i18n';
import createApp from './boot/expressApp';

let websocket: SocketIO.Server;
const tmpDir = process.env.TEMPDATA || path.join(app.getPath('temp'), 'lumi');

const serverPaths = serverConfigFactory(
    process.env.USERDATA || app.getPath('userData'),
    tmpDir
);

const settingsCache = new SettingsCache(serverPaths.settingsFile);

/**
 * The DelayedEmitter queues websocket events until the websocket is connected.
 * We need it as the browser window and the client must be initialized before
 * we can send events, but the events are raised by the startup routine before
 * the initialization is over.
 */
const delayedWebsocketEmitter: DelayedEmitter = new DelayedEmitter(
    settingsCache
);
let mainWindow: electron.BrowserWindow;
let port: number;
let currentPath: string = '/';
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * (Re-)Creates the main window.
 * @param websocketArg
 */
export function createMainWindow(websocketArg: SocketIO.Server): void {
    mainWindow = createWindow(isDevelopment ? 3000 : port, isDevelopment);
    mainWindow.on('closed', () => {
        mainWindow = null;
        // If a new main window is recreated later (macOS), we need to
        // listen to the websocket's connection event again.
        delayedWebsocketEmitter.resetWebsocketConnection();
    });

    mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
        currentPath = new URL(url).pathname;
        updateMenu(currentPath, mainWindow, websocketArg, settingsCache);
    });

    i18next.on('languageChanged', (lng) => {
        updateMenu(currentPath, mainWindow, websocketArg, settingsCache);
    });

    updateMenu('/', mainWindow, websocketArg, settingsCache);
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
    app.quit();
} else {
    Sentry.init({
        dsn: 'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
        release: app.getVersion(),
        environment: process.env.NODE_ENV,
        beforeSend: async (event: Sentry.Event) => {
            if ((await settingsCache.getSettings()).bugTracking) {
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
            if ((await settingsCache.getSettings()).usageStatistics) {
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
        // Performs migrations needed due to updates.
        await migrations(serverPaths);

        // Make sure required directories exist
        await fsExtra.mkdirp(serverPaths.contentStoragePath);
        await fsExtra.mkdirp(serverPaths.librariesPath);
        await fsExtra.mkdirp(serverPaths.temporaryStoragePath);

        // Initialize localization
        const translationFunction = await initI18n(settingsCache);

        // Create the express server logic
        const expressApp = await createApp(
            serverPaths,
            mainWindow,
            settingsCache,
            translationFunction,
            {
                devMode: electron.app.commandLine.hasSwitch('dev'),
                libraryDir:
                    electron.app.commandLine.getSwitchValue('libs') !== ''
                        ? electron.app.commandLine.getSwitchValue('libs')
                        : undefined
            }
        );

        log.info('app is ready');
        const server = await createHttpServer(expressApp);
        log.info('server booted');

        // The port in production is random and is 3000 in dev.
        port = (server.address() as any).port;
        log.info(`port is ${port}`);

        websocket = createWebsocket(server);
        log.info('websocket created');
        delayedWebsocketEmitter.setWebsocket(websocket);

        initUpdater(app, websocket, serverPaths, settingsCache);
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
            if ((await settingsCache.getSettings()).usageStatistics) {
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
