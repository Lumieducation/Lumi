import { app } from 'electron';
import * as SocketIO from 'socket.io';

import { Context } from '../../boot';

export default function relaunch(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('relaunch', async () => {
    context.log.info('events:websocket:relaunch');

    app.relaunch();
    app.quit();
  });
}
