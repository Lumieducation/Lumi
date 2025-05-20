import { UpdateInfo, autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import dialog_update_show from '../../ops/dialog_update_show';

export default function update_available(ctx: Context) {
  autoUpdater.on('update-available', (update_info: UpdateInfo) => {
    ctx.log.info('events:autoUpdater:update-available', update_info);
    dialog_update_show(ctx, update_info.version);
  });
}
