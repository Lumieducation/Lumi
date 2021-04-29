import express from 'express';
import * as Sentry from '@sentry/node';
import IServerConfig from '../IServerConfig';
import { BrowserWindow, dialog } from 'electron';
import User from '../User';
import fs from 'fs-extra';
import path from 'path';
import superagent from 'superagent';
import proxy from 'express-http-proxy';

import * as H5P from '@lumieducation/h5p-server';
import HtmlExporter from '@lumieducation/h5p-html-exporter';

import settingsCache from '../settingsCache';

import LumiController from '../controllers/LumiController';

import { io as websocket } from '../websocket';
import LumiError from '../helpers/LumiError';

const runHost = process.env.LUMI_HOST || 'https://lumi.run';

export default function (
    serverConfig: IServerConfig,
    h5pEditor: H5P.H5PEditor,
    browserWindow: BrowserWindow
): express.Router {
    const router = express.Router();
    const lumiController = new LumiController(
        h5pEditor,
        serverConfig,
        browserWindow
    );

    router.post(
        '/',
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            let filePath: string =
                req.query.filePath && `${req.query.filePath}`;

            const contentId = req.body.contentId;

            if (!contentId) {
                if (!filePath) {
                    const { filePaths } = await dialog.showOpenDialog(
                        browserWindow,
                        {
                            filters: [
                                {
                                    extensions: ['h5p'],
                                    name: 'HTML 5 Package'
                                }
                            ],
                            properties: ['openFile']
                        }
                    );

                    filePath = filePaths[0];
                }

                if (!filePath) {
                    return res.status(499).end();
                }
            }

            if (contentId) {
                filePath = path.join(
                    serverConfig.temporaryStoragePath,
                    `${contentId}.h5p`
                );
                await lumiController.export(`${contentId}`, filePath);
            }

            try {
                const response = await superagent
                    .post(`${runHost}/api/v1/run`)
                    .set('x-auth', settingsCache.getSettings().token)
                    .attach('h5p', filePath)
                    .on('progress', (event) => {
                        websocket.emit('action', {
                            type: 'action',
                            payload: {
                                type: 'RUN_UPDATE_STATE',
                                payload: {
                                    showDialog: true,
                                    uploadProgress: {
                                        state: 'pending',
                                        progress:
                                            event.loaded / (event.total / 100)
                                    }
                                }
                            }
                        });
                    });

                if (contentId) {
                    await fs.unlink(filePath);
                }
                res.status(200).json(response.body);
            } catch (error) {
                res.status(error.status || 500).json(
                    new LumiError(
                        error.code,
                        error.message,
                        error.status,
                        error
                    )
                );
            }
        }
    );

    router.use(
        '/',
        (req, res, next) => {
            if (settingsCache.getSettings().token) {
                req.headers['x-auth'] = settingsCache.getSettings().token;
            }
            next();
        },
        proxy(runHost)
    );

    return router;
}
