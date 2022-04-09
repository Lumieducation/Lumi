import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import SocketIO from 'socket.io';
import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import IServerConfig from '../config/IPaths';
import SettingsCache from '../config/SettingsCache';
import i18next from 'i18next';
import path from 'path';

let updateAvailable: boolean = false;
let updating: boolean = false;

const t = i18next.getFixedT(null, 'lumi');

const loadPlatformInformation = (): {
    package: string;
    platform: string;
    supportsUpdates: 'no' | 'external' | 'yes';
} => {
    const platformInfoDir = path.join(
        __dirname,
        '../../../../platform-information'
    );
    if (!fsExtra.pathExistsSync(platformInfoDir)) {
        return undefined;
    }

    const files = fsExtra.readdirSync(platformInfoDir);
    if (files.length < 1) {
        return undefined;
    }

    try {
        const platformInfo = fsExtra.readJSONSync(
            path.join(platformInfoDir, files[0])
        );
        return platformInfo;
    } catch {
        return undefined;
    }
};

export const platformSupportsUpdates = () => {
    if (process.env.DISABLE_UPDATES) {
        return false;
    }

    if (process.platform === 'darwin') {
        return !process.mas;
    }

    // Linux and Windows support updates depending on the build
    const platformInfo = loadPlatformInformation();
    if (!platformInfo) {
        return false;
    }
    if (platformInfo.supportsUpdates === 'yes') {
        return true;
    }

    return false;
};

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
