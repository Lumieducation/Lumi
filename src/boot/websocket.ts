import * as http from 'http';
import * as SocketIO from 'socket.io';

import { Context } from './index';
import setup_websocket_events from '../events/websocket/setup_websocket_events';

export default function boot_websocket(
  ctx: Context,
  http_server: http.Server
): SocketIO.Server {
  const io = new SocketIO.Server(http_server);

  io.on('connection', (socket) => {
    setup_websocket_events(ctx, socket);
    ctx.log.info('websocket connection established');
  });

  return io;
}
