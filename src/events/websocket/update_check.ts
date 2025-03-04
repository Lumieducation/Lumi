import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import update_check from '../../ops/update_check';

export default function settings_update(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('update_check', async (payload) => {
    update_check(context);
  });
}
