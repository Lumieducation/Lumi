import Logger from '../helper/Logger';

import server from '../';

import setup from './setup';

const log = new Logger('boot');

export default async () => {
    await setup();

    return server.listen(
        process.env.PORT || process.env.NODE_ENV === 'development' ? 3001 : 0,
        () => {
            log.info(`server booted on port ${(server.address() as any).port}`);
        }
    );
};
