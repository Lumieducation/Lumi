import { BrowserWindow } from 'electron';

import { Context } from '../boot';
import { show_settings_menu } from '../menu';

export default async function window_setup_open(
  ctx: Context
): Promise<BrowserWindow> {
  ctx.log.info(`ops:window_setup_open`);
  const win = new BrowserWindow({
    width: 960,
    height: 600
  });

  win.loadURL(`http://localhost:${ctx.is_development ? 8000 : ctx.port}/setup`);

  if (ctx.is_development) {
    win.webContents.openDevTools();
  }

  win.on('focus', () => {
    show_settings_menu(ctx);
  });

  ctx.log.info(`Opened setup window`);

  return win;
}
