import Logger from '../helper/Logger';
import server from '../';
import setup from './setup';

const log = new Logger('boot');

export default async () => {
    await setup();

    return server.listen(process.env.PORT || 0, () => {
        log.info(`server booted on port ${(server.address() as any).port}`);
    });
};
