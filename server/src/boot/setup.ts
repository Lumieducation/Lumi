import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import { app } from 'electron';
import path from 'path';
import IServerConfig from '../config/IPaths';
import { fsImplementations } from '@lumieducation/h5p-server';
import defaultSettings from '../config/defaultSettings';

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

        if (await fsExtra.pathExists(deprecatedContentStoragePath)) {
            fsExtra.remove(deprecatedContentStoragePath); // deliberately without await to not block the setup if it takes long.
        }

        if (await fsExtra.pathExists(deprecatedTemporaryStoragePath)) {
            fsExtra.remove(deprecatedTemporaryStoragePath); // deliberately without await to not block the setup if it takes long.
        }

        // Make sure required directories exist
        await fsExtra.mkdirp(serverConfig.librariesPath);
        await fsExtra.mkdirp(serverConfig.temporaryStoragePath);

        // Check if current settings exists and is read- and parsable
        let settingOk = false;
        try {
            if (await fsExtra.pathExists(serverConfig.settingsFile)) {
                await fsExtra.readJSON(serverConfig.settingsFile);
                settingOk = true;
            }
        } catch (error) {
            settingOk = false;
        }

        if (!settingOk) {
            await fsExtra.writeJSON(serverConfig.settingsFile, {
                ...defaultSettings,
                language: app.getLocale()
            });
        }

        const checkSettings = await fsExtra.readJSON(serverConfig.settingsFile);

        if (!checkSettings.language) {
            fsExtra.writeJSON(serverConfig.settingsFile, {
                ...checkSettings,
                language: app.getLocale()
            });
        }

        settingsCache.setSettings(
            await fsExtra.readJSON(serverConfig.settingsFile)
        );
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
