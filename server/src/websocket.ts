import SocketIO from 'socket.io';
import * as Sentry from '@sentry/node';
import http from 'http';

import Logger from './helpers/Logger';

const log = new Logger('websocket');

export default function (server: http.Server): SocketIO.Server {
    log.info('booting');
    const io: SocketIO.Server = SocketIO(server);
    io.on('connection', () => {
        log.info('new connection');
    });

    io.on('error', (error) => {
        Sentry.captureException(error);
    });
    return io;
}
