import { autoUpdater } from 'electron-updater';

import { Context } from '../boot';

export default async function update_download(ctx: Context) {
  ctx.log.info('update_download');
  autoUpdater.downloadUpdate();
}
