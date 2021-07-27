import path from 'path';
import IServerConfig from './IServerConfig';

export default (userData: string, tempData: string): IServerConfig => {
    return {
        librariesPath: path.join(userData, 'libraries'),
        cache: path.join(userData, 'store.json'),
        temporaryStoragePath: path.join(tempData, 'tmp'),
        workingCachePath: path.join(tempData, 'workingCache'),
        configFile: path.join(userData, 'config.json'),
        settingsFile: path.join(userData, 'settings.json')
    };
};
