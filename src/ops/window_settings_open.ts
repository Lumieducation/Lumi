import { BrowserWindow } from 'electron';

import { Context } from '../boot';

export default async function window_settings_open(
  ctx: Context
): Promise<BrowserWindow> {
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

  ctx.log.info(`Opened settings window`);

  return win;
}
