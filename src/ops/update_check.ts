import { autoUpdater } from 'electron-updater';

import { Context } from '../boot';
import window_snackbar_show from './window_snackbar_show';

export default async function update_check(ctx: Context) {
  autoUpdater.checkForUpdates();

  window_snackbar_show(ctx, 'update', `Checking for updates`, 'info');
}
