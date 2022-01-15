import { H5PEditor, H5PPlayer } from '@lumieducation/h5p-server';
import { TFunction } from 'i18next';
import H5PConfig from '../config/H5PConfig';
import IServerConfig from '../config/IPaths';
import SettingsCache from '../config/SettingsCache';
import createH5PEditor from './h5pEditor';

export async function initH5P(
    serverConfig: IServerConfig,
    translationFunction: TFunction,
    settingsCache: SettingsCache,
    options?: {
        devMode?: boolean;
        libraryDir?: string;
    }
): Promise<{ h5pEditor: H5PEditor; h5pPlayer: H5PPlayer }> {
    const config = await new H5PConfig(settingsCache).load();

    // The H5PEditor object is central to all operations of
    // @lumieducation/h5p-server if you want to user the editor component.
    const h5pEditor: H5PEditor = await createH5PEditor(
        config,
        options?.libraryDir ?? serverConfig.librariesPath, // the path on the local disc where libraries should be stored)
        serverConfig.contentStoragePath, // the path on the local disc where content is stored. Only used / necessary if you use the local filesystem content storage class.
        serverConfig.temporaryStoragePath, // the path on the local disc where temporary files (uploads) should be stored. Only used / necessary if you use the local filesystem temporary storage class.
        (key, language) => translationFunction(key, { lng: language }),
        {
            disableLibraryCache: options?.devMode
        }
    );

    h5pEditor.setRenderer((model) => model);

    const h5pPlayer = new H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config,
        undefined,
        undefined,
        (key, language) => translationFunction(key, { lng: language })
    );

    h5pPlayer.setRenderer((model) => model);

    return { h5pEditor, h5pPlayer };
}
