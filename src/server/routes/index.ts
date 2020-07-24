import express from 'express';
import { adapters, H5PEditor } from 'h5p-nodejs-library';

import h5pConfig from '../../config/h5pConfig';
import lumiH5PRoutes from './lumi-h5p';
import trackRoutes from './track';

import Logger from '../helpers/Logger';
import User from '../h5pImplementations/User';
const log = new Logger('routes');

export default function (h5pEditor: H5PEditor): express.Router {
    const router = express.Router();

    log.info('setting up routes');

    router.use('/api/track/v0', trackRoutes());

    // Adding dummy user to make sure all requests can be handled
    router.use((req, res, next) => {
        (req as any).user = new User();
        next();
    });

    router.use(
        h5pConfig.baseUrl,
        adapters.express(
            h5pEditor,
            `${__dirname}/../../../h5p/core`,
            `${__dirname}/../../../h5p/editor`
        )
    );

    router.use('/api/lumi-h5p/v1', lumiH5PRoutes(h5pEditor));

    router.get('*', express.static(`${__dirname}/../../client`));

    return router;
}
