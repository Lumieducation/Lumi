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
import initUpdater from './services/updater';
import createWebsocket from './boot/websocket';
import serverConfigFactory from './config/defaultPaths';
import matomo from './boot/matomo';
import i18next from 'i18next';
import fsExtra from 'fs-extra';

import updateMenu from './menu';
import SettingsCache from './config/SettingsCache';
import DelayedEmitter from './helpers/DelayedEmitter';
import createWindow from './boot/clientWindow';
import migrations from './boot/migrations';
import initI18n from './boot/i18n';
import createApp from './boot/expressApp';
import StateStorage from './state/electronState';
import FilePickers from './helpers/FilePickers';
import FileHandleManager from './state/FileHandleManager';
import FileController from './controllers/FileController';
import { initH5P } from './boot/h5p';
import { initBugTracking } from './boot/bugTracking';
import { platformSupportsUpdates } from './services/platformInformation';

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

const electronState = new StateStorage();
const fileHandleManager = new FileHandleManager();

let fileController: FileController;

/**
 * (Re-)Creates the main window.
 * @param websocketArg
 */
export function createMainWindow(websocketArg: SocketIO.Server): void {
    mainWindow = createWindow(
        isDevelopment ? 3000 : port,
        isDevelopment,
        electronState
    );

    mainWindow.on('closed', () => {
        mainWindow = null;
        // If a new main window is recreated later (macOS), we need to
        // listen to the websocket's connection event again.
        delayedWebsocketEmitter.resetWebsocketConnection();
    });

    mainWindow.webContents.on('did-navigate-in-page', (event, url) => {
        currentPath = new URL(url).pathname;
        updateMenu(
            currentPath,
            mainWindow,
            websocketArg,
            settingsCache,
            electronState,
            fileController
        );
    });

    i18next.on('languageChanged', (lng) => {
        updateMenu(
            currentPath,
            mainWindow,
            websocketArg,
            settingsCache,
            electronState,
            fileController
        );
    });

    updateMenu(
        '/',
        mainWindow,
        websocketArg,
        settingsCache,
        electronState,
        fileController
    );
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
    app.quit();
} else {
    initBugTracking(settingsCache);

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
                            files: openFilePaths
                                .map((p) => fileHandleManager.create(p))
                                .map((fh) => ({
                                    fileHandleId: fh.handleId,
                                    path: fh.filename
                                }))
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
                files: [
                    {
                        fileHandleId:
                            fileHandleManager.create(openedFilePath).handleId,
                        path: openedFilePath
                    }
                ]
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
            const settings = await settingsCache.getSettings();
            if (settings.usageStatistics) {
                const data = {
                    url: '/Lumi',
                    _id: settings.machineId,
                    uid: settings.machineId,
                    e_c: 'App',
                    e_a: 'quit',
                    lang: electron.app.getLocale(),
                    ua: os.type()
                };
                matomo.track(data);
            }
        } catch (error: any) {
            Sentry.captureException(error);
        }
    });

    app.on('will-quit', (event) => {
        log.debug(`Deleting temporary directory: ${tmpDir}`);
        fsExtra.removeSync(tmpDir);
    });

    // create main BrowserWindow when electron is ready
    app.on('ready', async () => {
        log.debug('Electron ready event');
        settingsCache.init();

        // Performs migrations needed due to updates.
        await migrations(serverPaths);

        // Make sure required directories exist
        await fsExtra.mkdirp(serverPaths.contentStoragePath);
        await fsExtra.mkdirp(serverPaths.librariesPath);
        await fsExtra.mkdirp(serverPaths.temporaryStoragePath);

        // Initialize localization
        const translationFunction = await initI18n(settingsCache);

        const { h5pEditor, h5pPlayer } = await initH5P(
            serverPaths,
            translationFunction,
            settingsCache,
            {
                devMode: electron.app.commandLine.hasSwitch('dev'),
                libraryDir:
                    electron.app.commandLine.getSwitchValue('libs') !== ''
                        ? electron.app.commandLine.getSwitchValue('libs')
                        : undefined
            }
        );

        // Create the express server logic
        const expressApp = await createApp(
            h5pEditor,
            h5pPlayer,
            serverPaths,
            () => mainWindow,
            settingsCache,
            translationFunction,
            electronState,
            new FilePickers(fileHandleManager),
            fileHandleManager
        );

        log.info('app is ready');
        const server = await createHttpServer(expressApp, isDevelopment);
        log.info('server booted');

        // The port in production is random and is 3000 in dev.
        port = (server.address() as any).port;
        log.info(`port is ${port}`);

        websocket = createWebsocket(server);
        log.info('websocket created');
        delayedWebsocketEmitter.setWebsocket(websocket);

        if (platformSupportsUpdates()) {
            initUpdater(app, websocket, settingsCache);
            log.info('Updater started.');
        } else {
            log.info('Platform does not support auto updates.');
        }

        fileController = new FileController(
            h5pEditor,
            () => mainWindow,
            electronState,
            new FilePickers(fileHandleManager),
            fileHandleManager
        );

        createMainWindow(websocket);
        log.info('window created');

        const argv = process.argv;
        if (argv.length >= 2) {
            // Check if there are H5Ps specified in the command line args and
            // load them (Windows only).
            argv.splice(0, 1);
            const openFilePaths = argv.filter((arg) => arg.endsWith('.h5p'));
            if (openFilePaths.length > 0) {
                log.debug(`Opening file(s): ${openFilePaths.join(' ')}`);
                delayedWebsocketEmitter.emit('action', {
                    payload: {
                        files: openFilePaths
                            .map((fp) => fileHandleManager.create(fp))
                            .map((fh) => ({
                                fileHandleId: fh.handleId,
                                path: fh.filename
                            }))
                    },
                    type: 'OPEN_H5P'
                });
            }
        }

        try {
            const settings = await settingsCache.getSettings();
            if (settings.usageStatistics) {
                const data = {
                    url: '/Lumi',
                    _id: settings.machineId,
                    uid: settings.machineId,
                    e_c: 'App',
                    e_a: 'start',
                    lang: electron.app.getLocale(),
                    ua: os.type()
                };
                matomo.track(data);
            }
        } catch (error: any) {
            Sentry.captureException(error);
        }
    });
}
