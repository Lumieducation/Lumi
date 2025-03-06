import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import update_quit_and_install from '../../ops/update_quit_and_install';

export default function settings_update(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('update_install', async (payload) => {
    context.log.info('events:websocket:update_install', payload);
    update_quit_and_install(context);
  });
}
