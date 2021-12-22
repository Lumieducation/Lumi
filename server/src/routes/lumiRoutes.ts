import express from 'express';
import { H5PEditor } from '@lumieducation/h5p-server';
import * as Sentry from '@sentry/node';
import * as _path from 'path';

import LumiController from '../controllers/LumiController';
import Logger from '../helpers/Logger';
import IServerConfig from '../config/IPaths';
import { BrowserWindow } from 'electron';
import StateStorage from '../state/electronState';
import { IFilePickers } from '../types';
import FileHandleManager from '../state/FileHandleManager';

const log = new Logger('routes:lumi-h5p');

export default function (
    h5pEditor: H5PEditor,
    serverConfig: IServerConfig,
    browserWindow: BrowserWindow,
    electronState: StateStorage,
    filePickers: IFilePickers,
    fileHandleManager: FileHandleManager
): express.Router {
    const router = express.Router();
    const lumiController = new LumiController(
        h5pEditor,
        serverConfig,
        browserWindow,
        electronState,
        filePickers,
        fileHandleManager
    );

    router.get(
        '/package/:contentId',
        async (req: express.Request, res: express.Response) => {
            const { contentId } = req.params;
            try {
                const content = await lumiController.loadPackage(contentId);
                log.info(`sending package-data for contentId ${contentId} `);
                res.status(200).json(content);
            } catch (error: any) {
                Sentry.captureException(error);
                log.warn(error);
                res.status(404).end();
            }
        }
    );

    router.get(
        '/pick_h5p_files',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            lumiController
                .pickH5PFiles()
                .then((result) => {
                    if (result) {
                        res.status(200).json(result);
                    } else {
                        res.status(404).send();
                    }
                })
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    router.get(
        '/pick_css_file',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            lumiController
                .pickCSSFile()
                .then((result) => {
                    res.status(200).json({
                        fileHandleId: result.fileHandle,
                        filename: _path.basename(result.path)
                    });
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
                .import(req.body.fileHandleId)
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
            req: express.Request<
                {},
                {},
                {},
                { contentId: string; fileHandleId: string }
            >,
            res: express.Response,
            next: express.NextFunction
        ) => {
            lumiController
                // the casts assume we don't get arrays of complex objects from
                // the client
                .export(
                    req.query.contentId,
                    req.query.fileHandleId === 'undefined'
                        ? undefined
                        : req.query.fileHandleId
                )
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    log.error(`Error while saving H5P: ${error}`);
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
