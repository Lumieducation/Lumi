import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import SocketIO from 'socket.io';
import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import IServerConfig from './IServerConfig';

let updateAvailable: boolean = false;
let updating: boolean = false;

export default async function boot(
    app: Electron.App,
    websocket: SocketIO.Server,
    serverConfig: IServerConfig
): Promise<void> {
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

    if ((await fsExtra.readJSON(serverConfig.settingsFile)).autoUpdates) {
        autoUpdater.checkForUpdates();
    }
}
