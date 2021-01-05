import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import nucleus from 'nucleus-nodejs';
import SocketIO from 'socket.io';

let updateAvailable: boolean = false;
let updating: boolean = false;

export default function boot(
    app: Electron.App,
    websocket: SocketIO.Server
): void {
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

    app.on('will-quit', event => {
        if (updateAvailable && !updating) {
            event.preventDefault();

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
