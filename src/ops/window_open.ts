import { BrowserWindow } from 'electron';

import { Context } from '../boot';
import content_url from './content_url';
import content_import from './content_import';
import content_config_write from './content_config_write';
import setup_window_events from '../events/window/setup_window_events';

export default async function window_open(
  ctx: Context,
  content_id: string,
  path?: string
): Promise<BrowserWindow> {
  ctx.log.debug(`ops:window_open`, { content_id });
  const win = new BrowserWindow({
    width: 960,
    height: 600
  });

  if (path) {
    try {
      win.loadURL(
        `http://localhost:${ctx.is_development ? 8000 : ctx.port}/loading?path=${path}`
      );
      const content = await content_import(ctx, [path]);
      content_id = content[0].id;
      await content_config_write(ctx, content_id, 'path', path);
    } catch (error) {
      ctx.log.error(`Error loading content from path: ${path}`, error);
      win.loadURL(
        `http://localhost:${ctx.is_development ? 8000 : ctx.port}/error?message=${error.message}`
      );
      return win;
    }
  }

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
