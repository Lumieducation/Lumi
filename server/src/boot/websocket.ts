import SocketIO from 'socket.io';
import * as Sentry from '@sentry/node';
import http from 'http';

import Logger from '../helpers/Logger';

const log = new Logger('websocket');

export let globalWebsocket: SocketIO.Server;

export default function (server: http.Server): SocketIO.Server {
    log.info('booting');
    globalWebsocket = new SocketIO.Server(server);
    globalWebsocket.on('connection', (socket: SocketIO.Socket) => {
        log.info('new connection');

        socket.on('dispatch', (action) => {
            log.info(action);

            globalWebsocket.emit('action', action);
        });
        socket.on('error', (error) => {
            Sentry.captureException(error);
        });
    });

    return globalWebsocket;
}
