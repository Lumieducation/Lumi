import express from 'express';
import fsExtra from 'fs-extra';
import path from 'path';

import config from '../config/config';

// tslint:disable-next-line: import-name
import * as H5P from 'h5p-nodejs-library';
// tslint:disable-next-line: no-submodule-imports
import H5PEditor from 'h5p-nodejs-library/build/src/H5PEditor';

import PlayerRenderer from '../h5p/Player.renderer';

import Logger from '../helper/Logger';

import User from '../h5p/User';

const log = new Logger('controller:h5p');

export class H5PController {
    constructor(h5pLibrary: any) {
        log.info(`initialize`);
        this.h5pLibrary = h5pLibrary;

        this.getAjax = this.getAjax.bind(this);
        this.getContentFile = this.getContentFile.bind(this);
        this.getLibraryFile = this.getLibraryFile.bind(this);
        this.getTemporaryFile = this.getTemporaryFile.bind(this);
        this.loadPackage = this.loadPackage.bind(this);
        this.postAjax = this.postAjax.bind(this);
        this.renderPackage = this.renderPackage.bind(this);
    }

    private h5pLibrary: H5PEditor;

    public getAjax(req: express.Request, res: express.Response): void {
        try {
            const { action } = req.query;
            const {
                majorVersion,
                minorVersion,
                machineName,
                language
            } = req.query;

            log.info(`getAjax called with action ${action}`);

            switch (action) {
                case 'content-type-cache':
                    this.h5pLibrary
                        .getContentTypeCache(new User())
                        .then(contentTypeCache => {
                            log.info(`sending content type cache`);
                            res.status(200).json(contentTypeCache);
                        });
                    break;

                case 'libraries':
                    if (!majorVersion || !minorVersion || !machineName) {
                        log.warn(`missing library query`);
                        return res.status(400).end();
                    }
                    this.h5pLibrary
                        .getLibraryData(
                            machineName,
                            majorVersion,
                            minorVersion,
                            language
                        )
                        .then(library => {
                            log.info(`sending library data`);
                            res.status(200).json(library);
                        })
                        .catch(error => {
                            log.error(error);
                            res.status(404).end();
                        });
                    break;

                default:
                    log.warn(`no corresponding action found`);
                    res.status(400).end();
                    break;
            }
        } catch (error) {
            log.error(error);
            res.status(500).json(error);
        }
    }

    public async getContentFile(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const stream = await this.h5pLibrary.getContentFileStream(
            req.params.id,
            req.params.file,
            new User()
        );
        stream.on('end', () => {
            res.end();
        });
        stream.pipe(res.type(path.basename(req.params.file)));
    }

    public async getLibraryFile(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const stream = this.h5pLibrary.libraryManager.getFileStream(
            H5P.LibraryName.fromUberName(req.params.uberName),
            req.params.file
        );
        stream.on('end', () => {
            res.end();
        });
        stream.pipe(res.type(path.basename(req.params.file)));
    }

    public async getTemporaryFile(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const stream = await this.h5pLibrary.getContentFileStream(
            undefined,
            req.params.file,
            new User()
        );
        stream.on('end', () => {
            res.end();
        });
        stream.pipe(res.type(path.basename(req.params.file)));
    }

    public loadPackage(req: express.Request, res: express.Response): void {
        const { contentId } = req.params;

        log.info(`loading package with contentId ${contentId}`);
        this.h5pLibrary
            .loadH5P(contentId)
            .then(content => {
                log.info(`sending package-data for contentId ${contentId} `);
                res.status(200).json(content);
            })
            .catch(error => {
                log.warn(error);
                res.status(404).end();
            });
    }

    public async postAjax(
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const { action } = req.query;
        log.info(`post ajax with action ${action}`);
        switch (action) {
            case 'libraries':
                if (!req.body.libraries || !Array.isArray(req.body.libraries)) {
                    log.warn(`no libraries provided`);
                    return res.status(400).end();
                }
                this.h5pLibrary
                    .getLibraryOverview(req.body.libraries)
                    .then(libraries => {
                        res.status(200).json(libraries);
                    });
                break;

            case 'translations':
                const translationsResponse = await this.h5pLibrary.getLibraryLanguageFiles(
                    req.body.libraries,
                    req.query.language
                );
                res.status(200).json({
                    data: translationsResponse,
                    success: true
                });
                break;

            case 'files':
                if (
                    !(req as any).files ||
                    !(req as any).files.file ||
                    !req.body.contentId
                ) {
                    log.warn(`no file or contentId submitted`);
                    return res.status(400).end();
                }
                this.h5pLibrary
                    .saveContentFile(
                        req.body.contentId,
                        JSON.parse(req.body.field),
                        (req as any).files.file,
                        new User()
                    )
                    .then(response => {
                        log.info(`sending response`);
                        res.status(200).json(response);
                    });
                break;

            case 'library-install':
                const { id } = req.query;
                log.info(`installing library with id ${id}`);
                if (!id) {
                    log.warn(`no id provided`);
                    return res.status(400).end();
                }
                this.h5pLibrary
                    .installLibrary(id, new User())
                    .then(() => {
                        log.info(
                            `installation of library ${id} successful - getting content type cache`
                        );
                        return this.h5pLibrary
                            .getContentTypeCache(new User())
                            .then(contentTypeCache => {
                                log.info(
                                    `library installation succesful - sending content type cache`
                                );
                                res.status(200).json({
                                    data: contentTypeCache,
                                    success: true
                                });
                            })
                            .catch(error => {
                                log.error(`could not get content type cache`);
                                res.status(500).end();
                            });
                    })
                    .catch(error => {
                        log.warn(error);
                        res.status(404).end();
                    });
                break;

            case 'library-upload':
                log.info(`uploading library`);
                if (
                    !(req as any).files ||
                    !(req as any).files.h5p ||
                    !(req as any).files.h5p.data
                ) {
                    log.warn(`no data provided`);
                    return res.status(400).end();
                }

                const {
                    metadata,
                    parameters
                } = await this.h5pLibrary.uploadPackage(
                    (req as any).files.h5p.data,
                    new User()
                );
                const contentTypes = await this.h5pLibrary.getContentTypeCache(
                    new User()
                );

                log.info(`sending response`);
                res.status(200).json({
                    data: {
                        contentTypes,
                        // tslint:disable-next-line: object-literal-sort-keys
                        content: parameters,
                        h5p: metadata
                    },
                    success: true
                });
                break;

            default:
                res.status(400).end();
                break;
        }
    }

    public async renderPackage(
        req: express.Request,
        res: express.Response
    ): Promise<any> {
        const { contentId } = req.params;

        log.info(`rendering package with contentId ${contentId}`);

        const libraryLoader = (machineName, majorVersion, minorVersion) =>
            require(`${config.librariesPath}/${machineName}-${majorVersion}.${minorVersion}/library.json`);

        const player = new H5P.H5PPlayer(
            libraryLoader,
            {
                baseUrl: '/api/v0/h5p',
                downloadUrl: '/api/v0/h5p/download',
                libraryUrl: `/api/v0/h5p/libraries`,
                scriptUrl: `/api/v0/h5p/core/js`,
                stylesUrl: `/api/v0/h5p/core/styles`
            },
            null,
            null
        );

        player.useRenderer(PlayerRenderer);

        try {
            const h5pObject = await fsExtra.readFile(
                `${config.workingCachePath}/${contentId}/h5p.json`,
                'utf8'
            );
            const contentObject = await fsExtra.readFile(
                `${config.workingCachePath}/${contentId}/content.json`,
                'utf8'
            );

            const content = JSON.parse(contentObject);
            const h5p = JSON.parse(h5pObject);
            player
                .render(contentId, content, h5p)
                .then(h5pPage => {
                    res.status(200).end(h5pPage);
                })
                .catch(error => {
                    log.error(error);
                    res.status(404).end();
                });
        } catch (error) {
            log.warn(error);
            res.status(404).end();
        }
    }
}

export default H5PController;
