import electron, { dialog } from 'electron';
import { autoUpdater, ProgressInfo, UpdateInfo } from 'electron-updater';
import SocketIO from 'socket.io';
import * as Sentry from '@sentry/electron';
import SettingsCache from '../config/SettingsCache';
import i18next from 'i18next';

import { platformSupportsUpdates } from './platformInformation';
import { compareAppVersions } from '../helpers/compareAppVersions';

const t = i18next.getFixedT(null, 'lumi');

export default class Updater {
    private constructor(
        private app: Electron.App,
        private websocket: SocketIO.Server,
        private settingsCache: SettingsCache
    ) {}

    private updateAvailable: boolean = false;
    private updateInfo: UpdateInfo = null;
    private updating: boolean = false;

    public static create = async (
        app: Electron.App,
        websocket: SocketIO.Server,
        settingsCache: SettingsCache
    ): Promise<Updater> => {
        const updater = new Updater(app, websocket, settingsCache);
        await updater.init();
        return updater;
    };

    public check = async () => {
        const currentSettings = await this.settingsCache.getSettings();
        if (platformSupportsUpdates() && currentSettings.autoUpdates) {
            try {
                const updateCheckResult = await autoUpdater.checkForUpdates();
                this.updateInfo =
                    updateCheckResult?.updateInfo?.version &&
                    compareAppVersions(
                        electron.app.getVersion(),
                        updateCheckResult.updateInfo.version
                    ) > 0
                        ? updateCheckResult.updateInfo
                        : null;
            } catch (error) {
                this.updateInfo = null;
                Sentry.captureException(error);
            }
        }
    };

    async downloadAndQuit(): Promise<void> {
        if (this.hasUpdate()) {
            try {
                await autoUpdater.downloadUpdate();
            } catch (error) {
                Sentry.captureException(error);
            }
            autoUpdater.quitAndInstall();
        }
    }

    getUpdateInfo(): UpdateInfo {
        return this.updateInfo;
    }

    hasUpdate(): boolean {
        return (this.updateInfo = null);
    }

    private init = async () => {
        const currentSettings = await this.settingsCache.getSettings();
        autoUpdater.allowPrerelease = currentSettings.allowPrerelease;

        autoUpdater.on('update-downloaded', async () => {
            this.updateAvailable = true;

            this.websocket.emit('action', {
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

        autoUpdater.on('download-progress', (progressInfo: ProgressInfo) => {
            this.websocket.emit('action', {
                type: 'action',
                payload: {
                    type: 'UPDATES_DOWNLOADPROGRESS',
                    payload: progressInfo
                }
            });
        });

        this.app.on('will-quit', (event) => {
            if (this.updateAvailable && !this.updating) {
                event.preventDefault();

                dialog.showMessageBox({
                    message: t('notifications.updater.availableText'),
                    title: t('notifications.updater.availableTitle')
                });

                setTimeout(() => {
                    this.updating = true;
                    autoUpdater.quitAndInstall();
                }, 5000);
            }
        });
        await this.check();
    };
}
