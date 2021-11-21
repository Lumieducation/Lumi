import express from 'express';
import { autoUpdater, ProgressInfo } from 'electron-updater';

import { globalWebsocket as websocket } from '../boot/websocket';

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
                next(error);
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
                next(error);
            }
        }
    );

    return router;
}
