import express from 'express';
import { H5PEditor } from '@lumieducation/h5p-server';
import * as Sentry from '@sentry/node';
import LumiController from '../controllers/LumiController';
import Logger from '../helpers/Logger';
import IServerConfig from '../IServerConfig';

const log = new Logger('routes:lumi-h5p');

export default function (
    h5pEditor: H5PEditor,
    serverConfig: IServerConfig
): express.Router {
    const router = express.Router();
    const lumiController = new LumiController(h5pEditor, serverConfig);

    router.get(
        '/package/:contentId',
        async (req: express.Request, res: express.Response) => {
            const { contentId } = req.params;
            try {
                const content = await lumiController.loadPackage(contentId);
                log.info(`sending package-data for contentId ${contentId} `);
                res.status(200).json(content);
            } catch (error) {
                Sentry.captureException(error);
                log.warn(error);
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
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
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
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
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
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
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
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    router.delete(
        '/',
        async (
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
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    return router;
}
