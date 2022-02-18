import fs from 'fs-extra';
import _path from 'path';
import i18next from 'i18next';
import * as H5P from '@lumieducation/h5p-server';
import LumiError from '../helpers/LumiError';
import Logger from '../helpers/Logger';
import User from '../h5pImplementations/User';
import IServerConfig from '../config/IPaths';

const log = new Logger('controller:lumi-h5p');

const t = i18next.getFixedT(null, 'lumi');

export default class H5PController {
    constructor(private h5pEditor: H5P.H5PEditor, serverConfig: IServerConfig) {
        fs.readJSON(serverConfig.settingsFile).then((settings) => {
            if (settings.privacyPolicyConsent) {
                h5pEditor.contentTypeCache.updateIfNecessary();
            }
        });
    }

    public async delete(contentId: string): Promise<void> {
        return this.h5pEditor.deleteContent(contentId, new User());
    }
}
