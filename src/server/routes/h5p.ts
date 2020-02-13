import express from 'express';

import config from '../config/config';

import H5PController from '../controller/h5p';
import h5p from '../h5p';

import Logger from '../helper/Logger';

const log = new Logger('routes:h5p');

export default function(): express.Router {
    const router = express.Router();

    const h5pController = new H5PController(h5p);

    log.info(`setting up routes`);

    router.get('/ajax', h5pController.getAjax); // <--
    router.post('/ajax', h5pController.postAjax); // <--

    router.get(`/libraries/:uberName/:file(*)`, h5pController.getLibraryFile); // <--
    router.get(`/content/:id/content/:file(*)`, h5pController.getContentFile); // <--
    router.get(
        `${h5p.config.temporaryFilesPath}/:file(*)`,
        h5pController.getTemporaryFile
    ); // <--

    router.get('/package/:contentId', h5pController.loadPackage); // <--
    router.get('/package/:contentId/render', h5pController.renderPackage); // <--

    router.use('/content', express.static(`${config.workingCachePath}`)); // <--
    router.use('/libraries', express.static(`${config.librariesPath}`)); // <--

    const h5pCore = `${__dirname}/../../../h5p/core`;

    log.info(`setting up route for h5p-core: ${h5pCore}`); // <--
    router.use('/core', express.static(h5pCore)); // <--

    const h5pEditor = `${__dirname}/../../../h5p/editor`;

    log.info(`setting up route for h5p-editor: ${h5pEditor}`); // <--
    router.use('/editor', express.static(h5pEditor)); // <--

    return router;
}
