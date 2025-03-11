import { BrowserWindow } from 'electron';

import { Context } from '../boot';

export default async function window_all_reload(ctx: Context): Promise<void> {
  ctx.log.debug('ops:window_all_reload');
  const all_windows = BrowserWindow.getAllWindows();

  all_windows.forEach((window) => {
    window.reload();
  });
}
