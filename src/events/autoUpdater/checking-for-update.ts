import { autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import window_loading_show from '../../ops/window_loading_show';

export default function checking_for_update(ctx: Context) {
  autoUpdater.on('checking-for-update', () => {
    ctx.log.info('events:autoUpdater:checking-for-update');
    window_loading_show(ctx, 'update');
  });
}
