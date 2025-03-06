import { UpdateInfo, autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import update_quit_and_install from '../../ops/update_quit_and_install';

export default function update_available(ctx: Context) {
  autoUpdater.on('update-downloaded', (update_info: UpdateInfo) => {
    ctx.log.info('events:autoUpdater:update-downloaded', update_info);
    ctx.update.downloaded = true;

    if (ctx.update.quit_and_install) {
      ctx.log.info(`quit_and_install is true, calling update_quit_and_install`);
      update_quit_and_install(ctx);
    }
  });
}
