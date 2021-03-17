import * as Sentry from '@sentry/electron';
import fsExtra from 'fs-extra';
import { app } from 'electron';

import IServerConfig from '../IServerConfig';
import { fsImplementations, H5PConfig } from '@lumieducation/h5p-server';
import defaultSettings from './defaultSettings';
import defaultRun from './defaultRun';

import settingsCache from '../settingsCache';

export default async function setup(
    serverConfig: IServerConfig
): Promise<void> {
    try {
        // Make sure required directories exist
        await fsExtra.mkdirp(serverConfig.workingCachePath);
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

        // Check if current runsexists and is read- and parsable
        let runOk = false;
        try {
            if (await fsExtra.pathExists(serverConfig.runFile)) {
                await fsExtra.readJSON(serverConfig.runFile);
                runOk = true;
            }
        } catch (error) {
            runOk = false;
        }

        if (!runOk) {
            await fsExtra.writeJSON(serverConfig.runFile, defaultRun);
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
