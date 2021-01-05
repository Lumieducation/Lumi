import * as Sentry from '@sentry/node';
import fsExtra from 'fs-extra';

import IServerConfig from '../IServerConfig';
import { fsImplementations, H5PConfig } from '@lumieducation/h5p-server';

export default async function setup(
    serverConfig: IServerConfig
): Promise<void> {
    try {
        // Remove old leftovers
        await fsExtra.remove(serverConfig.workingCachePath);
        await fsExtra.remove(serverConfig.temporaryStoragePath);

        await fsExtra.mkdirp(serverConfig.workingCachePath);
        await fsExtra.mkdirp(serverConfig.librariesPath);
        await fsExtra.mkdirp(serverConfig.temporaryStoragePath);

        // we might need to update settings here and run upgrade scripts when for example the baseUrl changes
        if (!(await fsExtra.pathExists(serverConfig.configFile))) {
            // We write configuration values that are not automatically saved
            // when calling h5pConfig.save()
            await fsExtra.writeJSON(serverConfig.configFile, {
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
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
