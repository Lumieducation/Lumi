import express from 'express';
import { H5PEditor } from 'h5p-nodejs-library';
import h5pAjaxExpressRouter from 'h5p-nodejs-library/build/src/adapters/H5PAjaxRouter/H5PAjaxExpressRouter';

import h5pConfig from '../../config/h5pConfig';
import lumiRoutes from './lumiRoutes';
import trackingRoutes from './trackingRoutes';
import Logger from '../helpers/Logger';
import User from '../h5pImplementations/User';
import IServerConfig from '../../config/IServerConfig';

const log = new Logger('routes');

export default function (
    h5pEditor: H5PEditor,
    serverConfig: IServerConfig
): express.Router {
    const router = express.Router();

    log.info('setting up routes');

    router.use('/api/v1/track', trackingRoutes());

    // Adding dummy user to make sure all requests can be handled
    router.use((req, res, next) => {
        (req as any).user = new User();
        next();
    });

    // Directly serving the library and content files statically speeds up
    // loading times and there is no security issue, as Lumi never is a
    // multi-user environment.
    router.use(
        h5pConfig.baseUrl + h5pConfig.contentFilesUrl,
        express.static(`${serverConfig.workingCachePath}`)
    );
    router.use(
        h5pConfig.baseUrl + h5pConfig.librariesUrl,
        express.static(`${serverConfig.librariesPath}`)
    );

    router.use(
        h5pConfig.baseUrl,
        h5pAjaxExpressRouter(
            h5pEditor,
            `${__dirname}/../../../h5p/core`,
            `${__dirname}/../../../h5p/editor`,
            {
                routeGetContentFile: false,
                routeGetLibraryFile: false
            }
        )
    );

    router.use('/api/v1/lumi', lumiRoutes(h5pEditor));

    router.get('*', express.static(`${__dirname}/../../client`));

    return router;
}
