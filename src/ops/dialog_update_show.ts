import { dialog } from 'electron';

import { Context } from '../boot';
import update_download from './update_download';
import dialog_message_show from './dialog_message_show';
import update_quit_and_install from './update_quit_and_install';

enum Response {
  Later,
  Update
}
export default async function dialog_update_show(
  ctx: Context,
  version: string
): Promise<void> {
  ctx.log.debug(`ops:dialog_update_show`, { version });

  const result = await dialog.showMessageBox({
    message: ctx.translate('Update available: {{version}}', { version }),
    type: 'info',
    buttons: [ctx.translate('Later'), ctx.translate('Update now')]
  });

  if (result.response === Response.Later) {
    ctx.log.info('User chose to update later');
    return;
  }
  if (result.response === Response.Update) {
    ctx.log.info('User chose to update now');

    if (ctx.update.downloaded) {
      ctx.log.info(`Update is downloaded. Proceeding to quit and install`);
      dialog_message_show(`Update downloaded. Installing update...`, 'info');
      await update_quit_and_install(ctx);
    } else {
      ctx.log.info(
        `Update is not downloaded. Downloading update and setting quit_and_install flag to true`
      );
      dialog_message_show(
        ctx.translate(
          `Downloading update... The app will quit and install the update once it has been downloaded.`
        ),
        'info'
      );
      ctx.update.quit_and_install = true;
      await update_download(ctx);
    }
  }
}
