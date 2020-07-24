import { dialog } from 'electron';
import fs from 'fs-extra';
import _path from 'path';
import rimraf from 'rimraf';
import nucleus from 'nucleus-nodejs';
import fsExtra from 'fs-extra';

import appConfig from '../config/app-config';
import PlayerRenderer from '../h5p/Player.renderer';
import LumiError from '../helper/Error';
import h5p from '../h5p';
import * as H5P from 'h5p-nodejs-library';
import User from '../h5p/User';
import Logger from '../helper/Logger';

const log = new Logger('controller:lumi-h5p');

export class H5PController {
    constructor() {
        this.h5p = h5p;
        h5p.contentTypeCache.updateIfNecessary();
    }

    private h5p: H5P.H5PEditor;

    public async delete(contentId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const contentPath = _path.join(
                appConfig.workingCachePath,
                contentId
            );

            rimraf(contentPath, (error) => {
                if (error) {
                    return reject();
                }
                resolve();
            });
        });
    }

    public async export(
        contentId: string,
        pathArg?: string
    ): Promise<{ path: string }> {
        let path = pathArg;

        if (!path) {
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
            this.h5p.libraryStorage,
            this.h5p.contentStorage,
            {
                exportMaxContentPathLength: 255
            }
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

        const { metadata, parameters } = await this.h5p.uploadPackage(
            buffer,
            new User()
        );

        const id = await this.h5p.saveOrUpdateContent(
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
            // tslint:disable-next-line: object-literal-sort-keys
            library: this.getUbernameFromH5pJson(metadata)
        };
    }

    public async loadPackage(contentId: string) {
        log.info(`loading package with contentId ${contentId}`);
        return this.h5p.getContent(contentId);
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

    public async render(contentId: string): Promise<any> {
        log.info(`rendering package with contentId ${contentId}`);

        const player = new H5P.H5PPlayer(
            this.h5p.libraryStorage,
            this.h5p.contentStorage,
            this.h5p.config
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

        if (id) {
            const contentPath = _path.join(appConfig.workingCachePath, `${id}`);

            if (!(await fs.pathExists(contentPath))) {
                throw new LumiError(
                    'h5p-not-found',
                    'contentId not found',
                    404
                );
            }
        }

        const contentId = await this.h5p.saveOrUpdateContent(
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
            // tslint:disable-next-line: object-literal-sort-keys
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

export default new H5PController();
