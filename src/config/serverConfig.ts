import IServerConfig from './IServerConfig';

export default (userData: string): IServerConfig => {
    return {
        librariesPath: `${userData}/libraries`,
        cache: `${userData}/store.json`,
        temporaryStoragePath: `${userData}/tmp`,
        workingCachePath: `${userData}/workingCache`
    };
};
