import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

export default function boot(): void {
    autoUpdater.on('update-downloaded', async () => {
        dialog.showMessageBox({
            message:
                'Update downloaded, application will be quit for update...',
            title: 'Install Updates'
        });

        setTimeout(() => {
            autoUpdater.quitAndInstall();
        }, 5000);
    });

    autoUpdater.checkForUpdates();
}
