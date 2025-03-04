import { UpdateInfo, autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import update_quit_and_install from '../../ops/update_quit_and_install';

export default function update_available(ctx: Context) {
  autoUpdater.on('update-downloaded', (update_info: UpdateInfo) => {
    ctx.update.downloaded = true;
    ctx.log.info('Update downloaded', update_info);

    if (ctx.update.quit_and_install) {
      ctx.log.info(`quit_and_install is true, calling update_quit_and_install`);
      update_quit_and_install(ctx);
    }
  });
}
