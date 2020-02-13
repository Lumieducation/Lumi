import SocketIO from 'socket.io';

import server from '.';

import * as Sentry from '@sentry/node';

import Logger from './helper/Logger';

const log = new Logger('websocket');

log.info('booting');
const io = SocketIO(process.env.NODE_ENV === 'development' ? 3002 : server);

io.on('connection', () => {
    log.info('new connection');
});

io.on('error', error => {
    Sentry.captureException(error);
});

export default io;
