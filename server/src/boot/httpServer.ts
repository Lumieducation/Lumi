import http from 'http';
import { Express } from 'express';

import Logger from '../helpers/Logger';

const log = new Logger('boot');

export default async (
    app: Express,
    isDevelopment: boolean
): Promise<http.Server> => {
    const server = http.createServer(app);
    return new Promise((res, rej) => {
        const done = (): void => {
            log.info(`server booted on port ${(server.address() as any).port}`);
            res(server);
        };
        if (isDevelopment) {
            server.listen(
                process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 0,
                done
            );
        } else {
            server.listen(
                process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 0,
                'localhost',
                511,
                done
            );
        }
    });
};
