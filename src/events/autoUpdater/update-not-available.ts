import { autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import dialog_message_show from '../../ops/dialog_message_show';

export default function update_not_available(ctx: Context) {
  autoUpdater.on('update-not-available', () => {
    ctx.log.info(`No updates available`);
    dialog_message_show(ctx.translate('No updates available'), 'info');
  });
}
