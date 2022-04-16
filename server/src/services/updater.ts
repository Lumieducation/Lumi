import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import SocketIO from 'socket.io';
import * as Sentry from '@sentry/electron';
import SettingsCache from '../config/SettingsCache';
import i18next from 'i18next';

import { platformSupportsUpdates } from './platformInformation';

let updateAvailable: boolean = false;
let updating: boolean = false;

const t = i18next.getFixedT(null, 'lumi');

export default async function initUpdater(
    app: Electron.App,
    websocket: SocketIO.Server,
    settingsCache: SettingsCache
): Promise<void> {
    const currentSettings = await settingsCache.getSettings();
    autoUpdater.allowPrerelease = currentSettings.allowPrerelease;

    autoUpdater.on('update-downloaded', async () => {
        updateAvailable = true;

        websocket.emit('action', {
            payload: {
                message: t('notifications.updater.updateDownloaded'),
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

    if (platformSupportsUpdates() && currentSettings.autoUpdates) {
        autoUpdater.checkForUpdates();
    }
}
