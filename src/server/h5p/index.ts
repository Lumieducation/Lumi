import * as H5P from 'h5p-nodejs-library';

import appConfig from '../config/app-config';
import h5pConfig from '../config/h5p-config';

import DirectoryTemporaryFileStorage from './DirectoryTemporaryFileStorage';
import JsonStorage from './JsonStorage';

export default new H5P.H5PEditor(
    new JsonStorage(appConfig.cache),
    new H5P.H5PConfig(new H5P.fsImplementations.InMemoryStorage(), h5pConfig),
    new H5P.fsImplementations.FileLibraryStorage(appConfig.librariesPath),
    new H5P.fsImplementations.FileContentStorage(appConfig.workingCachePath),
    new DirectoryTemporaryFileStorage(appConfig.temporaryStoragePath)
);
