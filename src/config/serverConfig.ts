const userData = process.env.USERDATA;

export default {
    librariesPath: `${userData}/libraries`,
    cache: `${userData}/store.json`,
    temporaryStoragePath: `${userData}/tmp`,
    workingCachePath: `${userData}/workingCache`
};
