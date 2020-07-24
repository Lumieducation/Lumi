import http from 'http';

import app from './boot/app';
import Logger from './helpers/Logger';
import setup from './boot/setup';

const log = new Logger('boot');

export default async () => {
    await setup();
    const server = http.createServer(app);
    return server.listen(process.env.PORT || 0, () => {
        log.info(`server booted on port ${(server.address() as any).port}`);
    });
};
