import express from 'express';
import H5PController from '../controller/h5p';
import h5p from '../h5p';

import Logger from '../helper/Logger';

const log = new Logger('routes:h5p');

export default function (): express.Router {
    const router = express.Router();
    const h5pController = new H5PController(h5p);

    log.info(`setting up routes`);

    router.get('/package/:contentId', h5pController.loadPackage); // <--
    router.get('/package/:contentId/render', h5pController.renderPackage); // <--

    return router;
}
