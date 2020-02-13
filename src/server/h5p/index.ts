// tslint:disable-next-line: no-submodule-imports
import config from '../config/config';
import EditorConfig from '../config/EditorConfig';

import * as H5P from 'h5p-nodejs-library';

import DirectoryTemporaryFileStorage from './DirectoryTemporaryFileStorage';
import FileContentStorage from './FileContentStorage';
import FileLibraryStorage from './FileLibraryStorage';
import JsonStorage from './JsonStorage';

const editorConfig = new EditorConfig(new JsonStorage());

export default new H5P.H5PEditor(
    new JsonStorage(config.storage),
    editorConfig,
    new FileLibraryStorage(config.librariesPath),
    new FileContentStorage(config.workingCachePath),
    new H5P.TranslationService(H5P.englishStrings),
    (library, file) =>
        `/api/v0/h5p/libraries/${library.machineName}-${library.majorVersion}.${library.minorVersion}/${file}`,
    new DirectoryTemporaryFileStorage(config.temporaryStoragePath)
);
