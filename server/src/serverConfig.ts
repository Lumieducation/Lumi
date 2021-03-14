import path from 'path';
import IServerConfig from './IServerConfig';

export default (userData: string): IServerConfig => {
    return {
        librariesPath: path.join(userData, 'libraries'),
        cache: path.join(userData, 'store.json'),
        temporaryStoragePath: path.join(userData, 'tmp'),
        workingCachePath: path.join(userData, 'workingCache'),
        configFile: path.join(userData, 'config.json'),
        settingsFile: path.join(userData, 'settings.json')
    };
};
