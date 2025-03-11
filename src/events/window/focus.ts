import { BrowserWindow } from 'electron';

import { Context } from '../../boot';
import { show_content_menu } from '../../menu';

export default async function event_window_focus(
  context: Context,
  window: BrowserWindow
): Promise<void> {
  window.on('focus', async () => {
    context.log.info('events:window:focus');
    show_content_menu(context);
  });
}
