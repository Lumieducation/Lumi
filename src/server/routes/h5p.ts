import express from 'express';
import { adapters } from 'h5p-nodejs-library';

import appConfig from '../config/app-config';
import H5PController from '../controller/h5p';
import h5p from '../h5p';
import User from '../h5p/User';

import Logger from '../helper/Logger';

const log = new Logger('routes:h5p');

export default function (): express.Router {
    const router = express.Router();

    const defaultH5PController = new adapters.expressController(h5p);
    const h5pController = new H5PController(h5p);

    // Adding dummy user to make sure all requests can be handled
    router.use((req, res, next) => {
        (req as any).user = new User();
        next();
    });

    log.info(`setting up routes`);

    router.get('/ajax', defaultH5PController.getAjax); // <--
    router.post('/ajax', defaultH5PController.postAjax); // <--

    router.get(
        `/libraries/:uberName/:file(*)`,
        defaultH5PController.getLibraryFile
    ); // <--
    router.get(
        `/content/:id/content/:file(*)`,
        defaultH5PController.getContentFile
    ); // <--
    router.get(
        `${h5p.config.temporaryFilesUrl}/:file(*)`,
        defaultH5PController.getTemporaryContentFile
    ); // <--

    router.get('/package/:contentId', h5pController.loadPackage); // <--
    router.get('/package/:contentId/render', h5pController.renderPackage); // <--

    router.use('/content', express.static(`${appConfig.workingCachePath}`)); // <--
    router.use('/libraries', express.static(`${appConfig.librariesPath}`)); // <--

    const h5pCore = `${__dirname}/../../../h5p/core`;

    log.info(`setting up route for h5p-core: ${h5pCore}`); // <--
    router.use('/core', express.static(h5pCore)); // <--

    const h5pEditor = `${__dirname}/../../../h5p/editor`;

    log.info(`setting up route for h5p-editor: ${h5pEditor}`); // <--
    router.use('/editor', express.static(h5pEditor)); // <--

    return router;
}
