import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import update_check from '../../ops/update_check';

export default function settings_update(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('update_check', async (payload) => {
    context.log.info('events:websocket:update_check', payload);
    update_check(context);
  });
}
