import mkdirp from 'mkdirp';
import * as Sentry from '@sentry/node';

import fsExtra from 'fs-extra';

import IServerConfig from '../IServerConfig';

export default async function setup(
    serverConfig: IServerConfig
): Promise<void> {
    try {
        mkdirp.sync(serverConfig.workingCachePath);
        mkdirp.sync(serverConfig.librariesPath);
        mkdirp.sync(serverConfig.temporaryStoragePath);

        // we might need to update settings here and run upgrade scripts when for example the baseUrl changes

        if (!fsExtra.existsSync(serverConfig.configFile)) {
            fsExtra.writeFileSync(
                serverConfig.configFile,
                JSON.stringify({
                    fetchingDisabled: 0,
                    baseUrl: '/api/v1/h5p',
                    uuid: '8de62c47-f335-42f6-909d-2d8f4b7fb7f5',
                    siteType: 'local',
                    sendUsageStatistics: false,
                    hubRegistrationEndpoint: 'https://api.h5p.org/v1/sites',
                    hubContentTypesEndpoint:
                        'https://api.h5p.org/v1/content-types/',
                    contentTypeCacheRefreshInterval: 86400000,
                    enableLrsContentTypes: true,
                    editorAddons: {
                        'H5P.CoursePresentation': ['H5P.MathDisplay'],
                        'H5P.InteractiveVideo': ['H5P.MathDisplay'],
                        'H5P.DragQuestion': ['H5P.MathDisplay']
                    }
                })
            );
        }
    } catch (error) {
        Sentry.captureException(error);
        throw error;
    }
}
