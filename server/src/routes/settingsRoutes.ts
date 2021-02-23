import express from 'express';
import fsExtra from 'fs-extra';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import IServerConfig from '../IServerConfig';

export default function (
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow
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
                    await fsExtra.writeJSON(
                        serverConfig.settingsFile,
                        req.body
                    );

                    enum Answers {
                        Restart,
                        Later
                    }

                    const messageBox = await electron.dialog.showMessageBox(
                        browserWindow,
                        {
                            title: 'Settings changed',
                            message:
                                'You have changed your settings. The settings will be active after the next restart.',
                            buttons: ['Restart now', 'Later'],
                            icon: electron.nativeImage.createFromPath(
                                `${__dirname}/../../../electron/assets/lumi.png`
                            )
                        }
                    );

                    if (messageBox.response === Answers.Restart) {
                        electron.app.relaunch();
                        electron.app.exit();
                    }

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
