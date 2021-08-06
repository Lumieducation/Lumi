import express from 'express';
import fsExtra from 'fs-extra';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import IServerConfig from '../config/IPaths';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';

import { io as websocket } from '../boot/websocket';

export default function (): express.Router {
    const router = express.Router();
    router.get(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const updateCheckResult = await autoUpdater.checkForUpdates();

                res.status(200).json(updateCheckResult.updateInfo);
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    router.post(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                autoUpdater.on(
                    'download-progress',
                    (progressInfo: ProgressInfo) => {
                        websocket.emit('action', {
                            type: 'action',
                            payload: {
                                type: 'UPDATES_DOWNLOADPROGRESS',
                                payload: progressInfo
                            }
                        });
                    }
                );

                await autoUpdater.downloadUpdate();

                autoUpdater.quitAndInstall();
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    return router;
}
