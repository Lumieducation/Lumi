import * as electron from 'electron';

import { Context } from '../../boot';
import window_open from '../../ops/window_open';

export default function activate(ctx: Context) {
  electron.app.on('activate', () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      window_open(ctx, 'new');
    }
  });
}
