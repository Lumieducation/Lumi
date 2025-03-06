import { BrowserWindow } from 'electron';

import { Context } from '../../boot';
import window_close from '../../ops/window_close';
import window_get_content_id from '../../ops/window_get_content_id';

export default async function event_window_close(
  context: Context,
  window: BrowserWindow
): Promise<void> {
  window.on('close', async () => {
    context.log.info('events:window:close');
    const current_content_id = await window_get_content_id(window);
    await window_close(context, current_content_id);
  });
}
