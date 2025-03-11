import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import theme_updated from '../../ops/theme_updated';
import settings_write from '../../ops/settings_write';
import window_all_reload from '../../ops/window_all_reload';

export default function settings_update(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('settings_update', async (payload) => {
    context.log.info('events:websocket:settings_update', payload);

    await settings_write(context, payload);

    // Reload all windows if theme settings have changed
    if (theme_updated(payload)) {
      await window_all_reload(context);
    }
  });
}
