import { dialog } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';
import SocketIO from 'socket.io';
import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import IServerConfig from './IServerConfig';
import settingsCache from './settingsCache';

let updateAvailable: boolean = false;
let updating: boolean = false;

export const platformSupportsUpdates = () => {
    if (process.env.DISABLE_UPDATES) {
        return false;
    }
    if (process.platform === 'win32') {
        return !process.windowsStore;
    }
    if (process.platform === 'darwin') {
        return !process.mas;
    }
    if (process.platform === 'linux') {
        if (process.env.APPIMAGE) {
            return true;
        }
    }
    return false;
};

export default async function boot(
    app: Electron.App,
    websocket: SocketIO.Server,
    serverConfig: IServerConfig
): Promise<void> {
    autoUpdater.allowPrerelease = settingsCache.getSettings().allowPrerelease;

    autoUpdater.on('update-downloaded', async () => {
        updateAvailable = true;

        websocket.emit('action', {
            payload: {
                message: 'update-downloaded',
                type: 'info'
            },
            type: 'MESSAGE'
        });
    });

    autoUpdater.on('error', (error) => {
        Sentry.captureException(error);
    });

    app.on('will-quit', (event) => {
        if (updateAvailable && !updating) {
            event.preventDefault();

            dialog.showMessageBox({
                message:
                    'Update is available. The application will install the update and restart.',
                title: 'Install Updates'
            });

            setTimeout(() => {
                updating = true;
                autoUpdater.quitAndInstall();
            }, 5000);
        }
    });

    if (
        platformSupportsUpdates() &&
        (await fsExtra.readJSON(serverConfig.settingsFile)).autoUpdates
    ) {
        autoUpdater.checkForUpdates();
    }
}
