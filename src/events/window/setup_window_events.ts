import { BrowserWindow } from 'electron';

import close from './close';
import focus from './focus';
import { Context } from '../../boot';

export default async function setup_window_events(
  context: Context,
  window: BrowserWindow
): Promise<void> {
  context.log.info('events:window:setup_window_events');
  await close(context, window);
  await focus(context, window);
}
