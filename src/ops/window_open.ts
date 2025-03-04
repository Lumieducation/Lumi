import { BrowserWindow } from 'electron';

import { Context } from '../boot';
import content_url from './content_url';
import content_config_write from './content_config_write';
import setup_window_events from '../events/window/setup_window_events';

export default async function window_open(
  ctx: Context,
  content_id: string
): Promise<BrowserWindow> {
  const win = new BrowserWindow({
    width: 960,
    height: 600
  });

  win.loadURL(content_url(ctx, content_id));

  if (ctx.is_development) {
    win.webContents.openDevTools();
  }

  await setup_window_events(ctx, win);

  ctx.log.info(`Opened window for content ${content_id}`);

  if (content_id !== 'new') {
    await content_config_write(ctx, content_id, 'window_id', win.id.toString());
  }
  return win;
}
