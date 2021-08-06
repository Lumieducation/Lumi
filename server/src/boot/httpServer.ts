import http from 'http';
import { Express } from 'express';

import Logger from '../helpers/Logger';

const log = new Logger('boot');

export default async (app: Express) => {
    const server = http.createServer(app);
    return server.listen(process.env.PORT || 0, () => {
        log.info(`server booted on port ${(server.address() as any).port}`);
    });
};
