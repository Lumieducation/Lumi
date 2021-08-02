import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import { app } from 'electron';
import path from 'path';
import IServerConfig from '../IServerConfig';
import { fsImplementations, H5PConfig } from '@lumieducation/h5p-server';
import defaultSettings from './defaultSettings';

import settingsCache from '../settingsCache';

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

        // Check if current config exists and is read- and parsable
        let configOk = false;
        try {
            if (await fsExtra.pathExists(serverConfig.configFile)) {
                await fsExtra.readJSON(serverConfig.configFile);
                configOk = true;
            }
        } catch (error) {
            configOk = false;
        }
        // Create a new configuration if needed
        if (!configOk) {
            // We write configuration values that are not automatically saved
            // when calling h5pConfig.save()
            await fsExtra.writeJSON(serverConfig.configFile, {
                // we might need to update settings here and run upgrade scripts when for example the baseUrl changes
                baseUrl: '/api/v1/h5p',
                editorAddons: {
                    'H5P.CoursePresentation': ['H5P.MathDisplay'],
                    'H5P.InteractiveVideo': ['H5P.MathDisplay'],
                    'H5P.DragQuestion': ['H5P.MathDisplay']
                }
            });
            // Write all other default values to the config.
            const h5pConfig = new H5PConfig(
                new fsImplementations.JsonStorage(serverConfig.configFile),
                {
                    maxFileSize: 2 * 1024 * 1024 * 1014, // max. 2 GB
                    maxTotalSize: 2 * 1024 * 1024 * 1014 // max. 2 GB
                }
            );
            await h5pConfig.save();
        }

        settingsCache.setSettings(
            await fsExtra.readJSON(serverConfig.settingsFile)
        );
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
