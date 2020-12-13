import http from 'http';

import appFactory from './boot/app';
import Logger from './helpers/Logger';
import setup from './boot/setup';
import IServerConfig from '../config/IServerConfig';

const log = new Logger('boot');

export default async (serverConfig: IServerConfig) => {
    await setup(serverConfig);
    const app = appFactory(serverConfig);
    const server = http.createServer(await app);
    return server.listen(process.env.PORT || 0, () => {
        log.info(`server booted on port ${(server.address() as any).port}`);
    });
};
