import { autoUpdater } from 'electron-updater';

import { Context } from '../boot';

export default async function update_check_and_notify(ctx: Context) {
  try {
    ctx.log.debug('ops:update_check_and_notify');
    await autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    ctx.log.error('update_check_and_notify', error);
  }
}
