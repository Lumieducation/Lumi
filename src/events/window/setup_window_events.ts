import { BrowserWindow } from 'electron';

import close from './close';
import { Context } from '../../boot';

export default async function setup_window_events(
  context: Context,
  window: BrowserWindow
): Promise<void> {
  await close(context, window);
}
