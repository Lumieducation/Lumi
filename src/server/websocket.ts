import SocketIO from 'socket.io';
import * as Sentry from '@sentry/node';
import http from 'http';

import app from './boot/app';
import Logger from './helpers/Logger';

const log = new Logger('websocket');

log.info('booting');
const server = http.createServer(app);
const io =
    process.env.NODE_ENV === 'development' ? SocketIO(3002) : SocketIO(server);

io.on('connection', () => {
    log.info('new connection');
});

io.on('error', (error) => {
    Sentry.captureException(error);
});

export default io;
