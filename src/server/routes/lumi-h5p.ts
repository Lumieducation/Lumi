import express from 'express';

import H5PController from '../controller/h5p';
import lumiController from '../controller/lumi-h5p';
import h5p from '../h5p';

export default function (): express.Router {
    const router = express.Router();
    const h5pController = new H5PController(h5p);

    router.get('/package/:contentId', h5pController.loadPackage); // <--
    router.get('/package/:contentId/render', h5pController.renderPackage); // <--

    router.get(
        '/open_files',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            lumiController
                .open()
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => next(error));
        }
    );

    router.post(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            lumiController
                .import(req.body.path)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => next(error));
        }
    );

    router.get(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            lumiController
                // the casts assume we don't get arrays of complex objects from
                // the client
                .export(req.query.contentId as string, req.query.path as string)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => next(error));
        }
    );

    router.patch(
        `/`,
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const { parameters, metadata, library, id } = req.body;
            lumiController
                .update(parameters, metadata, library, id)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => next(error));
        }
    );

    router.delete(
        '/',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const { contentId } = req.query;
            lumiController
                // the cast assumes we don't get arrays of complex objects from
                // the client
                .delete(contentId as string)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => next(error));
        }
    );

    return router;
}
