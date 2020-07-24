import express from 'express';

import lumiController from '../controller/lumi-h5p';
import Logger from '../helper/Logger';
import h5p from '../h5p';

const log = new Logger('routes:lumi-h5p');

export default function (): express.Router {
    const router = express.Router();

    router.get(
        '/package/:contentId',
        async (req: express.Request, res: express.Response) => {
            const { contentId } = req.params;
            try {
                const content = await lumiController.loadPackage(contentId);
                log.info(`sending package-data for contentId ${contentId} `);
                res.status(200).json(content);
            } catch (error) {
                log.warn(error);
                res.status(404).end();
            }
        }
    );

    router.get(
        '/package/:contentId/render',
        async (req: express.Request, res: express.Response) => {
            const { contentId } = req.params;
            try {
                const h5pPage = await lumiController.render(contentId);
                res.status(200).end(h5pPage);
            } catch {
                res.status(404).end();
            }
        }
    );

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
