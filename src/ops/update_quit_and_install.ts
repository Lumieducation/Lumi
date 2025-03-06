import { autoUpdater } from 'electron-updater';

import { Context } from '../boot';

export default async function update_quit_and_install(ctx: Context) {
  ctx.log.info('ops:update_quit_and_install');
  autoUpdater.quitAndInstall();
}
