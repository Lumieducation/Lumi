import express from 'express';
import * as Sentry from '@sentry/node';

import { platformSupportsUpdates } from '../services/platformInformation';
import Updater from '../services/Updater';

export default function (updater?: Updater): express.Router {
    const router = express.Router();
    router.get(`/`, async (req: express.Request, res: express.Response) => {
        if (!platformSupportsUpdates()) {
            res.status(400).send('Platform does not support updates');
            return;
        }
        try {
            await updater?.check();
            if (updater?.hasUpdate()) {
                return res.status(200).json(updater.getUpdateInfo());
            }
            return res.status(404).send();
        } catch (error: any) {
            Sentry.captureException(error);
            res.status(500).end();
        }
    });

    router.post(`/`, async (req: express.Request, res: express.Response) => {
        if (!platformSupportsUpdates()) {
            res.status(400).send('Platform does not support updates');
            return;
        }
        try {
            await updater?.downloadAndQuit();
        } catch (error: any) {
            Sentry.captureException(error);
            res.status(500).end();
        }
    });

    return router;
}
