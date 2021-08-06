import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import { app } from 'electron';
import path from 'path';
import IServerConfig from '../config/IPaths';

import settingsCache from '../config/SettingsCache';

export default async function setup(
    serverConfig: IServerConfig
): Promise<void> {
    try {
        // If the workingCache (prior 0.8.0) still exists in userData remove it. -> https://github.com/Lumieducation/Lumi/pull/1727
        const deprecatedContentStoragePath = path.join(
            process.env.USERDATA || app.getPath('userData'),
            'workingCache'
        );

        const deprecatedTemporaryStoragePath = path.join(
            process.env.USERDATA || app.getPath('userData'),
            'tmp'
        );

        const deprecatedConfigPath = path.join(
            process.env.USERDATA || app.getPath('userData'),
            'config.json'
        );

        if (await fsExtra.pathExists(deprecatedContentStoragePath)) {
            fsExtra.remove(deprecatedContentStoragePath); // deliberately without await to not block the setup if it takes long.
        }

        if (await fsExtra.pathExists(deprecatedTemporaryStoragePath)) {
            fsExtra.remove(deprecatedTemporaryStoragePath); // deliberately without await to not block the setup if it takes long.
        }

        if (await fsExtra.pathExists(deprecatedConfigPath)) {
            fsExtra.remove(deprecatedConfigPath); // deliberately without await to not block the setup if it takes long.
        }

        // Make sure required directories exist
        await fsExtra.mkdirp(serverConfig.librariesPath);
        await fsExtra.mkdirp(serverConfig.temporaryStoragePath);
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
