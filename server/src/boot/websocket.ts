import SocketIO from 'socket.io';
import * as Sentry from '@sentry/node';
import http from 'http';

import Logger from '../helpers/Logger';

const log = new Logger('websocket');

let io: SocketIO.Server;

export { io };

export default function (server: http.Server): SocketIO.Server {
    log.info('booting');
    io = new SocketIO.Server(server);
    io.on('connection', (socket: SocketIO.Socket) => {
        log.info('new connection');

        socket.on('dispatch', (action) => {
            log.info(action);

            io.emit('action', action);
        });
        socket.on('error', (error) => {
            Sentry.captureException(error);
        });
    });

    return io;
}
