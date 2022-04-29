import express from 'express';
import matomo from '../boot/matomo';
import * as Sentry from '@sentry/node';
import electron from 'electron';
import * as os from 'os';
import { nanoid } from 'nanoid';

import SettingsCache from '../config/SettingsCache';

const id = nanoid(16);

export default function (settingsCache: SettingsCache): express.Router {
    const router = express.Router();
    router.post(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const settings = await settingsCache.getSettings();
                if (settings.usageStatistics) {
                    const { action, category, name, value } = req.body;
                    const data = {
                        url: '/Lumi',
                        _id: id,
                        uid: settings.machineId,
                        e_c: category,
                        e_a: action,
                        e_n: name,
                        e_v: value,
                        lang: electron.app.getLocale().substring(0, 2),
                        ua: os.type()
                    };
                    matomo.track(data);
                }
                res.status(200).end();
            } catch (error: any) {
                Sentry.captureException(error);
                res.status(200).end();
            }
        }
    );

    return router;
}
