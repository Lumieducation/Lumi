import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import settings_write from '../../ops/settings_write';

export default function settings_update(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('settings_update', async (payload) => {
    await settings_write(context, payload);
  });
}
