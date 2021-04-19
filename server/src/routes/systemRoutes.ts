import express from 'express';
import * as Sentry from '@sentry/electron';

import { platformSupportsUpdates } from '../updater';

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
                    platformSupportsUpdates: platformSupportsUpdates()
                });
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).json(error);
            }
        }
    );

    return router;
}
