import * as electron from 'electron';

import { Context } from '../../boot';

export default function window_all_closed(ctx: Context) {
  electron.app.on('window-all-closed', () => {
    ctx.log.info(`events:app:window-all-closed`);
    if (process.platform !== 'darwin') {
      electron.app.quit();
    }
  });
}
