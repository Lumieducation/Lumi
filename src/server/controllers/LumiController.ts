import { dialog } from 'electron';
import fs from 'fs-extra';
import _path from 'path';
import nucleus from 'nucleus-nodejs';

import PlayerRenderer from '../h5pImplementations/Player.renderer';
import LumiError from '../helpers/LumiError';
import * as H5P from 'h5p-nodejs-library';
import User from '../h5pImplementations/User';
import Logger from '../helpers/Logger';

const log = new Logger('controller:lumi-h5p');

export default class LumiController {
    constructor(private h5pEditor: H5P.H5PEditor) {
        h5pEditor.contentTypeCache.updateIfNecessary();
    }

    public async delete(contentId: string): Promise<void> {
        return this.h5pEditor.deleteContent(contentId, new User());
    }

    public async export(
        contentId: string,
        pathArg?: string
    ): Promise<{ path: string }> {
        let path = pathArg;

        if (!path || path === 'undefined') {
            path = dialog.showSaveDialogSync({
                defaultPath: '.h5p',
                filters: [
                    {
                        extensions: ['h5p'],
                        name: 'HTML 5 Package'
                    }
                ],
                title: 'Save H5P'
            });
        }

        if (!path) {
            throw new LumiError('user-abort', 'Aborted by user', 400);
        }

        if (_path.extname(path) !== '.h5p') {
            path = `${path}.h5p`;
        }

        const stream = fs.createWriteStream(path);
        const packageExporter = new H5P.PackageExporter(
            this.h5pEditor.libraryStorage,
            this.h5pEditor.contentStorage,
            this.h5pEditor.config
        );
        await packageExporter.createPackage(contentId, stream, new User());

        nucleus.track('export');
        return { path };
    }

    public async import(
        path: string
    ): Promise<{
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

        nucleus.track('import', {
            library: this.getUbernameFromH5pJson(metadata)
        });

        return {
            id,
            metadata,
            parameters,
            library: this.getUbernameFromH5pJson(metadata)
        };
    }

    public async loadPackage(
        contentId: string
    ): Promise<{
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
        const response = await dialog.showOpenDialog({
            filters: [
                {
                    extensions: ['h5p'],
                    name: 'HTML 5 Package'
                }
            ],
            properties: ['openFile', 'multiSelections']
        });

        return response.filePaths;
    }

    public async renderPlayer(contentId: string): Promise<any> {
        log.info(`rendering package with contentId ${contentId}`);

        const player = new H5P.H5PPlayer(
            this.h5pEditor.libraryStorage,
            this.h5pEditor.contentStorage,
            this.h5pEditor.config
        );
        player.setRenderer(PlayerRenderer);

        try {
            return player.render(contentId);
        } catch (error) {
            log.warn(error);
            throw new LumiError('h5p-not-found', error.message, 404);
        }
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
