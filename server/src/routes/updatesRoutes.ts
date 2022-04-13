import express from 'express';
import * as Sentry from '@sentry/node';
import { autoUpdater, ProgressInfo } from 'electron-updater';

import { globalWebsocket as websocket } from '../boot/websocket';
import { platformSupportsUpdates } from '../services/platformInformation';

export default function (): express.Router {
    const router = express.Router();
    router.get(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            if (!platformSupportsUpdates()) {
                res.status(400).send('Platform does not support updates');
                return;
            }
            try {
                const updateCheckResult = await autoUpdater.checkForUpdates();

                res.status(200).json(updateCheckResult.updateInfo);
            } catch (error: any) {
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
            if (!platformSupportsUpdates()) {
                res.status(400).send('Platform does not support updates');
                return;
            }
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
            } catch (error: any) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    return router;
}
