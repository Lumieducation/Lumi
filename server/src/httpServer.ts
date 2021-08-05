import http from 'http';
import electron from 'electron';

import appFactory from './boot/app';
import Logger from './helpers/Logger';
import setup from './boot/setup';
import IServerConfig from './config/IPaths';

const log = new Logger('boot');

let server: http.Server;

export { server };

/**
 * options.devMode: true if the app should be used to develop libraries
 * options.libraryDir: a directory in the filesystem at which libraries should
 * be stored
 */
export default async (
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow,
    options?: {
        devMode?: boolean;
        libraryDir?: string;
    }
) => {
    await setup(serverConfig);
    const app = appFactory(serverConfig, browserWindow, options);
    server = http.createServer(await app);
    return server.listen(process.env.PORT || 0, () => {
        log.info(`server booted on port ${(server.address() as any).port}`);
    });
};
