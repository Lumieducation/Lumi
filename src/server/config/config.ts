const userData = process.env.USERDATA;

export default {
    librariesPath: `${userData}/libraries`,
    storage: `${userData}/store.json`,
    temporaryStoragePath: `${userData}/tmp`,
    workingCachePath: `${userData}/workingCache`
};
