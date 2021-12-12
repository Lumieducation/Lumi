import { BrowserWindow, dialog } from 'electron';
import fs from 'fs-extra';
import _path from 'path';
import i18next from 'i18next';

import Sentry from '@sentry/node';
import LumiError from '../helpers/LumiError';
import * as H5P from '@lumieducation/h5p-server';
import Logger from '../helpers/Logger';
import User from '../h5pImplementations/User';
import IServerConfig from '../config/IPaths';
import electronState from '../state/electronState';
import { sanitizeFilename } from '../helpers/FilenameSanitizer';

const log = new Logger('controller:lumi-h5p');

const t = i18next.getFixedT(null, 'lumi');

export default class LumiController {
    constructor(
        private h5pEditor: H5P.H5PEditor,
        serverConfig: IServerConfig,
        private browserWindow: BrowserWindow
    ) {
        fs.readJSON(serverConfig.settingsFile).then((settings) => {
            if (settings.privacyPolicyConsent) {
                h5pEditor.contentTypeCache.updateIfNecessary();
            }
        });
    }

    public async delete(contentId: string): Promise<void> {
        return this.h5pEditor.deleteContent(contentId, new User());
    }

    public async export(
        contentId: string,
        pathArg?: string
    ): Promise<{ path: string }> {
        try {
            let path = pathArg;

            const { params } = await this.h5pEditor.getContent(
                contentId,
                new User()
            );

            if (!path || path === 'undefined') {
                const result = await dialog.showSaveDialog(this.browserWindow, {
                    defaultPath: _path.join(
                        electronState.getState().lastDirectory,
                        sanitizeFilename(
                            params?.metadata?.title,
                            t('editor.saveAsDialog.fallbackFilename')
                        ) ?? t('editor.saveAsDialog.fallbackFilename')
                    ),
                    filters: [
                        {
                            extensions: ['h5p'],
                            name: t('editor.extensionName')
                        }
                    ],
                    title: t('editor.saveAsDialog.title'),
                    properties: ['showOverwriteConfirmation']
                });
                path = result.filePath;
            }

            if (!path) {
                throw new LumiError('user-abort', 'Aborted by user', 499);
            }

            electronState.setState({ lastDirectory: _path.dirname(path) });

            if (_path.extname(path) !== '.h5p') {
                path = `${path}.h5p`;
            }

            electronState.setState({ blockKeyboard: true });

            const stream = fs.createWriteStream(path);
            const packageExporter = new H5P.PackageExporter(
                this.h5pEditor.libraryManager,
                this.h5pEditor.contentStorage,
                this.h5pEditor.config
            );
            await packageExporter.createPackage(contentId, stream, new User());
            // We also need to wait for the stream to finish before returning, so
            // that the user is notified correctly about fact that saving is still
            // going on.
            await new Promise<void>((y, n) => {
                stream.on('finish', () => {
                    y();
                });
            }).finally(() => {
                electronState.setState({ blockKeyboard: false });
            });

            return { path };
        } catch (error: any) {
            electronState.setState({ blockKeyboard: false });
            Sentry.captureException(error);
        }
    }

    public async import(path: string): Promise<{
        id: string;
        library: string;
        metadata: H5P.IContentMetadata;
        parameters: any;
    }> {
        const buffer = await fs.readFile(path);

        const { metadata, parameters } = await this.h5pEditor.uploadPackage(
            buffer,
            new User()
        );

        const id = await this.h5pEditor.saveOrUpdateContent(
            undefined,
            parameters,
            metadata,
            this.getUbernameFromH5pJson(metadata),
            new User()
        );

        return {
            id,
            metadata,
            parameters,
            library: this.getUbernameFromH5pJson(metadata)
        };
    }

    public async loadPackage(contentId: string): Promise<{
        h5p: H5P.IContentMetadata;
        library: string;
        params: {
            metadata: H5P.IContentMetadata;
            params: H5P.ContentParameters;
        };
    }> {
        log.info(`loading package with contentId ${contentId}`);
        return this.h5pEditor.getContent(contentId);
    }

    public async open(): Promise<string[]> {
        const response = await dialog.showOpenDialog(this.browserWindow, {
            defaultPath: electronState.getState().lastDirectory,
            filters: [
                {
                    extensions: ['h5p'],
                    name: t('editor.extensionName')
                }
            ],
            properties: ['openFile', 'multiSelections']
        });

        if (
            response.filePaths &&
            response.filePaths.length > 0 &&
            response.filePaths[0] !== ''
        ) {
            electronState.setState({
                lastDirectory: _path.dirname(response.filePaths[0])
            });
        }

        return response.filePaths;
    }

    public async update(
        parameters: any,
        metadata: H5P.IContentMetadata,
        library: string,
        argId?: string
    ): Promise<{
        id: string;
        library: string;
        metadata: H5P.IContentMetadata;
        parameters: any;
    }> {
        let id: any;
        if (argId !== 'undefined') {
            id = argId;
        }

        if (id && !(await this.h5pEditor.contentManager.contentExists(id))) {
            throw new LumiError('h5p-not-found', 'content not found', 404);
        }

        const contentId = await this.h5pEditor.saveOrUpdateContent(
            id,
            parameters,
            metadata,
            library,
            new User()
        );

        return {
            library,
            metadata,
            parameters,
            id: contentId
        };
    }

    private getUbernameFromH5pJson(h5pJson: H5P.IContentMetadata): string {
        const library = (h5pJson.preloadedDependencies || []).find(
            (dependency) => dependency.machineName === h5pJson.mainLibrary
        );
        if (!library) {
            return '';
        }
        return H5P.LibraryName.toUberName(library, { useWhitespace: true });
    }
}
