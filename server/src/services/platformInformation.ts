import * as path from 'path';
import * as fsExtra from 'fs-extra';

import { IPlatformInformation } from '../types';
import Logger from '../helpers/Logger';

const log = new Logger('platformInformation');

let platformInformation: IPlatformInformation;

export const getPlatformInformation = (): IPlatformInformation => {
    if (platformInformation) {
        return platformInformation;
    }

    const platformInfoDir = path.join(
        __dirname,
        '../../../../platform-information'
    );
    if (!fsExtra.pathExistsSync(platformInfoDir)) {
        return undefined;
    }

    const files = fsExtra.readdirSync(platformInfoDir);
    if (files.length < 1) {
        return undefined;
    }

    try {
        const p = path.join(platformInfoDir, files[0]);
        log.info('Platform info path: ', p);
        platformInformation = fsExtra.readJSONSync(p);
        return platformInformation;
    } catch {
        return undefined;
    }
};

export const platformSupportsUpdates = (): boolean => {
    if (process.env.DISABLE_UPDATES) {
        return false;
    }

    if (process.platform === 'darwin') {
        return !process.mas;
    }

    // Linux and Windows support updates depending on the build
    const platformInfo = getPlatformInformation();
    if (!platformInfo) {
        return false;
    }
    if (platformInfo.supportsUpdates === 'yes') {
        return true;
    }

    return false;
};
