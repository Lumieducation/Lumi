import express from 'express';
import * as Sentry from '@sentry/electron';

import { platformSupportsUpdates } from '../updater';

export type Platform =
    | 'mac'
    | 'mas'
    | 'win'
    | 'win-store'
    | 'linux'
    | NodeJS.Platform;

function getPlatform(): Platform {
    if (process.mas) {
        return 'mas';
    }

    if (process.windowsStore) {
        return 'win-store';
    }

    if (process.platform === 'darwin') {
        return 'mac';
    }

    return process.platform;
}
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
                res.status(200).json({
                    platformSupportsUpdates: platformSupportsUpdates(),
                    platform: getPlatform()
                });
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).json(error);
            }
        }
    );

    return router;
}
