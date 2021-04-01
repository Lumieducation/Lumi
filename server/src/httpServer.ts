import http from 'http';
import electron from 'electron';

import appFactory from './boot/app';
import Logger from './helpers/Logger';
import setup from './boot/setup';
import IServerConfig from './IServerConfig';

const log = new Logger('boot');

let server: http.Server;

export { server };
export default async (
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow
) => {
    await setup(serverConfig);
    const app = appFactory(serverConfig, browserWindow);
    server = http.createServer(await app);
    return server.listen(process.env.PORT || 0, () => {
        log.info(`server booted on port ${(server.address() as any).port}`);
    });
};
