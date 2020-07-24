import * as H5P from 'h5p-nodejs-library';

import serverConfig from '../../config/serverConfig';
import h5pConfig from '../../config/h5pConfig';

import DirectoryTemporaryFileStorage from './DirectoryTemporaryFileStorage';
import JsonStorage from './JsonStorage';

export default new H5P.H5PEditor(
    new JsonStorage(serverConfig.cache),
    new H5P.H5PConfig(
        new H5P.fsImplementations.InMemoryStorage(),
        new H5P.H5PConfig(
            new H5P.fsImplementations.InMemoryStorage(),
            h5pConfig
        )
    ),
    new H5P.fsImplementations.FileLibraryStorage(serverConfig.librariesPath),
    new H5P.fsImplementations.FileContentStorage(serverConfig.workingCachePath),
    new DirectoryTemporaryFileStorage(serverConfig.temporaryStoragePath)
);
