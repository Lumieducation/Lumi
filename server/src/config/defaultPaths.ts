import path from 'path';
import IPaths from './IPaths';

/**
 * Creates the paths required for H5P to work.
 * @param userData a directory which is scoped per user and persistent
 * @param tempDir a temporary directory whose content can be deleted after the
 * app was closed
 * @returns
 */
export default (userData: string, tempData: string): IPaths => {
    return {
        contentStoragePath: path.join(tempData, 'contentStorage'),
        contentTypeCache: path.join(userData, 'store.json'),
        librariesPath: path.join(userData, 'libraries'),
        settingsFile: path.join(userData, 'settings.json'),
        temporaryStoragePath: path.join(tempData, 'tmp')
    };
};
