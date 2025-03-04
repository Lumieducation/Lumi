import { autoUpdater } from 'electron-updater';

import { Context } from '../boot';

export default async function update_quit_and_install(ctx: Context) {
  autoUpdater.quitAndInstall();
  ctx.log.info('update_quit_and_install');
}
