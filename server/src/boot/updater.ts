import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import SocketIO from 'socket.io';
import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import IServerConfig from '../config/IPaths';
import SettingsCache from '../config/SettingsCache';
import i18next from 'i18next';
import { platformSupportsUpdates } from '../services/platformInformation';

let updateAvailable: boolean = false;
let updating: boolean = false;

const t = i18next.getFixedT(null, 'lumi');

export default async function initUpdater(
    app: Electron.App,
    websocket: SocketIO.Server,
    serverConfig: IServerConfig,
    settingsCache: SettingsCache
): Promise<void> {
    autoUpdater.allowPrerelease = (
        await settingsCache.getSettings()
    ).allowPrerelease;

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
                message: t('notifications.updater.availableText'),
                title: t('notifications.updater.availableTitle')
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
