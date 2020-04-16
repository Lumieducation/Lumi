import { dialog } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import nucleus from 'nucleus-nodejs';

import websocket from './server/websocket';

let updateAvailable: boolean = false;
let updating: boolean = false;

export default function boot(app: Electron.App): void {
    log.info('initializing');
    autoUpdater.on('update-downloaded', async () => {
        log.info('update-downloaded');
        updateAvailable = true;

        websocket.emit('action', {
            payload: {},
            type: 'UPDATE_DOWNLOADED'
        });
    });

    autoUpdater.on('update-available', async info => {
        log.info('update-available');
        websocket.emit('action', {
            payload: {
                info
            },
            type: 'UPDATE_AVAILABLE'
        });
    });

    autoUpdater.on('error', async error => {
        log.error(error);
        websocket.emit('action', {
            payload: {
                error
            },
            type: 'UPDATE_ERROR'
        });
    });

    autoUpdater.on('checking-for-update', async info => {
        log.info('checking-for-update');
        websocket.emit('action', {
            payload: {
                info
            },
            type: 'UPDATE_CHECKING_FOR_UPDATE'
        });
    });

    autoUpdater.on('update-not-available', async info => {
        log.info('update-not-available');
        websocket.emit('action', {
            payload: {
                info
            },
            type: 'UPDATE_NOT_AVAILABLE'
        });
    });

    autoUpdater.on(
        'update-progress',
        async (progress, bytesPerSecond, percent, total, transferred) => {
            log.info('update-progress');
            websocket.emit('action', {
                payload: {
                    progress,
                    bytesPerSecond,
                    percent,
                    total,
                    transferred
                },
                type: 'UPDATE_PROGRESS'
            });
        }
    );

    app.on('will-quit', event => {
        if (updateAvailable && !updating) {
            event.preventDefault();

            log.info('update-will-install');
            dialog.showMessageBox({
                message:
                    'Update is available. The application will install the update and restart.',
                title: 'Install Updates'
            });

            setTimeout(() => {
                nucleus.track('system/updated');

                updating = true;
                autoUpdater.quitAndInstall();
            }, 5000);
        }
    });

    autoUpdater.checkForUpdates();
}
