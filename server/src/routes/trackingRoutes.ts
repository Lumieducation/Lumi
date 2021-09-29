import express from 'express';
import matomo from '../boot/matomo';
import IServerConfig from '../config/IPaths';
import electron from 'electron';
import * as os from 'os';
import { machineId } from 'node-machine-id';
import cryptoRandomString from 'crypto-random-string';

import SettingsCache from '../config/SettingsCache';

const id = cryptoRandomString({ length: 16 });

export default function (
    serverConfig: IServerConfig,
    settingsCache: SettingsCache
): express.Router {
    const router = express.Router();
    router.post(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                if ((await settingsCache.getSettings()).usageStatistics) {
                    const { action, category, name, value } = req.body;
                    const data = {
                        url: '/Lumi',
                        _id: id,
                        uid: await machineId(),
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
            } catch (error) {
                next(error);
            }
        }
    );

    return router;
}
