import { BrowserWindow } from 'electron';

import { Context } from '../boot';
import { show_settings_menu } from '../menu';

export default async function window_settings_open(
  ctx: Context
): Promise<BrowserWindow> {
  ctx.log.info(`ops:window_settings_open`);
  const win = new BrowserWindow({
    width: 960,
    height: 600
  });

  win.loadURL(
    `http://localhost:${ctx.is_development ? 8000 : ctx.port}/settings`
  );

  if (ctx.is_development) {
    win.webContents.openDevTools();
  }

  win.on('focus', () => {
    show_settings_menu(ctx);
  });

  ctx.log.info(`Opened settings window`);

  return win;
}
