import express from 'express';
import fsExtra from 'fs-extra';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import IServerConfig from '../IServerConfig';

export default function (
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow,
    app: express.Application
): express.Router {
    const router = express.Router();
    router.get(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const settings = await fsExtra.readJSON(
                    serverConfig.settingsFile
                );

                res.status(200).json(settings);
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    router.patch(
        '/',
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                if (req.body) {
                    await fsExtra.readJSON(serverConfig.settingsFile);

                    await fsExtra.writeJSON(
                        serverConfig.settingsFile,
                        req.body
                    );

                    res.status(200).json(req.body);
                }
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    return router;
}
