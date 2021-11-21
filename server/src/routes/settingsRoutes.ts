import express from 'express';
import * as Sentry from '@sentry/node';
import i18next from 'i18next';

import SettingsCache from '../config/SettingsCache';

export default function (settingsCache: SettingsCache): express.Router {
    const router = express.Router();
    router.get(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const settings = await settingsCache.getSettings();
                res.status(200).json(settings);
            } catch (error: any) {
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
                    const oldSettings = await settingsCache.getSettings();
                    await settingsCache.saveSettings(req.body);

                    if (
                        req.body.language &&
                        req.body.language !== oldSettings.language
                    ) {
                        await i18next.loadLanguages(req.body.language);
                        await i18next.changeLanguage(req.body.language);
                    }

                    res.status(200).json(req.body);
                }
            } catch (error: any) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    return router;
}
