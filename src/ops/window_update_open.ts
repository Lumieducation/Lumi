import { BrowserWindow } from 'electron';

import { Context } from '../boot';

export default async function window_update_open(
  ctx: Context,
  params?: any
): Promise<BrowserWindow> {
  ctx.log.debug('ops:window_update_open');
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

  win.loadURL(
    `http://localhost:${ctx.is_development ? 8000 : ctx.port}/update?version=${params?.version}&releaseDate=${params?.releaseDate}&releaseName=${params?.releaseName}`
  );

  if (ctx.is_development) {
    win.webContents.openDevTools();
  }

  ctx.log.info(`Opened update window`);

  return win;
}
