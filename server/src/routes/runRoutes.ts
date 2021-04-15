import express from 'express';
import * as Sentry from '@sentry/node';
import IServerConfig from '../IServerConfig';
import { BrowserWindow, dialog } from 'electron';
import User from '../User';
import fs from 'fs-extra';
import path from 'path';
import superagent from 'superagent';
import proxy from 'express-http-proxy';

import * as H5P from '@lumieducation/h5p-server';
import HtmlExporter from '@lumieducation/h5p-html-exporter';

import settingsCache from '../settingsCache';

import { io as websocket } from '../websocket';

export default function (
    serverConfig: IServerConfig,
    h5pEditor: H5P.H5PEditor,
    browserWindow: BrowserWindow
): express.Router {
    const router = express.Router();

    // router.get(
    //     `/`,
    //     async (
    //         req: express.Request,
    //         res: express.Response,
    //         next: express.NextFunction
    //     ) => {
    //         try {
    //             const run = await fs.readJSON(serverConfig.runFile);

    //             res.status(200).json(run);
    //         } catch (error) {
    //             Sentry.captureException(error);
    //             res.status(500).end();
    //         }
    //     }
    // );

    // router.patch(
    //     '/',
    //     async (
    //         req: express.Request,
    //         res: express.Response,
    //         next: express.NextFunction
    //     ) => {
    //         try {
    //             if (req.body) {
    //                 await fs.readJSON(serverConfig.runFile);

    //                 await fs.writeJSON(serverConfig.runFile, req.body);

    //                 res.status(200).json(req.body);
    //             }
    //         } catch (error) {
    //             Sentry.captureException(error);
    //             res.status(500).end();
    //         }
    //     }
    // );

    router.post(
        '/upload',
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            let filePath: string =
                req.query.filePath && `${req.query.filePath}`;
            if (!filePath) {
                const { filePaths } = await dialog.showOpenDialog(
                    browserWindow,
                    {
                        filters: [
                            {
                                extensions: ['h5p'],
                                name: 'HTML 5 Package'
                            }
                        ],
                        properties: ['openFile']
                    }
                );

                filePath = filePaths[0];
            }

            if (!filePath) {
                return res.status(499).end();
            }

            let htmlFilePath;
            let contentId;
            let meta;

            websocket.emit('action', {
                type: 'action',
                payload: {
                    type: 'RUN_UPDATE_STATE',
                    payload: {
                        showDialog: true,
                        uploadProgress: {
                            import: {
                                state: 'pending'
                            },
                            export: {
                                state: 'not_started'
                            },
                            upload: {
                                state: 'not_started',
                                progress: 0
                            }
                        }
                    }
                }
            });

            try {
                const buffer = await fs.readFile(filePath);

                const { metadata, parameters } = await h5pEditor.uploadPackage(
                    buffer,
                    new User()
                );

                meta = metadata;

                contentId = await h5pEditor.saveOrUpdateContent(
                    undefined,
                    parameters,
                    metadata,
                    getUbernameFromH5pJson(metadata),
                    new User()
                );

                websocket.emit('action', {
                    type: 'action',
                    payload: {
                        type: 'RUN_UPDATE_STATE',
                        payload: {
                            showDialog: true,
                            uploadProgress: {
                                import: {
                                    state: 'success'
                                },
                                export: {
                                    state: 'pending'
                                },
                                upload: {
                                    state: 'not_started',
                                    progress: 0
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                Sentry.captureException(error);
                return websocket.emit('action', {
                    type: 'action',
                    payload: {
                        type: 'RUN_UPDATE_STATE',
                        payload: {
                            showDialog: true,
                            uploadProgress: {
                                import: {
                                    state: 'error'
                                },
                                export: {
                                    state: 'not_started'
                                },
                                upload: {
                                    state: 'not_started',
                                    progress: 0
                                }
                            }
                        }
                    }
                });
            }

            try {
                const htmlExporter = new HtmlExporter(
                    h5pEditor.libraryStorage,
                    h5pEditor.contentStorage,
                    h5pEditor.config,
                    `${__dirname}/../../../h5p/core`,
                    `${__dirname}/../../../h5p/editor`
                );

                const html = await htmlExporter.createSingleBundle(
                    contentId,
                    new User()
                );

                htmlFilePath = path.join(
                    serverConfig.workingCachePath,
                    `${contentId}.html`
                );
                await fs.writeFileSync(htmlFilePath, html);

                websocket.emit('action', {
                    type: 'action',
                    payload: {
                        type: 'RUN_UPDATE_STATE',
                        payload: {
                            showDialog: true,
                            uploadProgress: {
                                import: {
                                    state: 'success'
                                },
                                export: {
                                    state: 'success'
                                },
                                upload: {
                                    state: 'pending',
                                    progress: 0
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                Sentry.captureException(error);
                return websocket.emit('action', {
                    type: 'action',
                    payload: {
                        type: 'RUN_UPDATE_STATE',
                        payload: {
                            showDialog: true,
                            uploadProgress: {
                                import: {
                                    state: 'success'
                                },
                                export: {
                                    state: 'error'
                                },
                                upload: {
                                    state: 'not_started',
                                    progress: 0
                                }
                            }
                        }
                    }
                });
            }
            let run;
            try {
                console.log('aaa');
                const response = await superagent
                    .post('http://localhost:8090')
                    .set('x-auth', settingsCache.getSettings().token)
                    .attach('content', htmlFilePath)
                    .field('title', meta.title)
                    .field('mainLibrary', meta.mainLibrary)
                    .on('progress', (event) => {
                        websocket.emit('action', {
                            type: 'action',
                            payload: {
                                type: 'RUN_UPDATE_STATE',
                                payload: {
                                    showDialog: true,
                                    uploadProgress: {
                                        import: {
                                            state: 'success'
                                        },
                                        export: {
                                            state: 'success'
                                        },
                                        upload: {
                                            state: 'pending',
                                            progress:
                                                event.loaded /
                                                (event.total / 100)
                                        }
                                    }
                                }
                            }
                        });
                    });

                websocket.emit('action', {
                    type: 'action',
                    payload: {
                        type: 'RUN_UPDATE_STATE',
                        payload: {
                            showDialog: true,
                            uploadProgress: {
                                import: {
                                    state: 'success'
                                },
                                export: {
                                    state: 'success'
                                },
                                upload: {
                                    state: 'success',
                                    progress: 100
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.log(error);
                Sentry.captureException(error);
                return websocket.emit('action', {
                    type: 'action',
                    payload: {
                        type: 'RUN_UPDATE_STATE',
                        payload: {
                            showDialog: true,
                            uploadProgress: {
                                import: {
                                    state: 'success'
                                },
                                export: {
                                    state: 'success'
                                },
                                upload: {
                                    state: 'error',
                                    progress: 0
                                }
                            }
                        }
                    }
                });
            }

            res.status(200).json(run);
        }
    );

    // router.delete(
    //     '/:id',
    //     async (
    //         req: express.Request,
    //         res: express.Response,
    //         next: express.NextFunction
    //     ) => {
    //         try {
    //             const response = await superagent.delete(
    //                 `http://lumi.run/${req.params.id}?secret=${req.query.secret}`
    //             );

    //             const run = await fs.readJSON(serverConfig.runFile);
    //             run.runs = run.runs.filter((r) => r.id !== req.params.id);
    //             await fs.writeJSON(serverConfig.runFile, run);

    //             res.status(200).json(response);
    //         } catch (error) {
    //             if (error.status === 404) {
    //                 const run = await fs.readJSON(serverConfig.runFile);
    //                 run.runs = run.runs.filter((r) => r.id !== req.params.id);
    //                 await fs.writeJSON(serverConfig.runFile, run);
    //             }
    //             Sentry.captureException(error);
    //             res.status(500).end();
    //         }
    //     }
    // );

    router.use(
        '/',
        (req, res, next) => {
            req.headers['x-auth'] = settingsCache.getSettings().token;
            next();
        },
        proxy(process.env.RUN_HOST || 'http://lumi.run')
    );

    return router;
}

function getUbernameFromH5pJson(h5pJson: H5P.IContentMetadata): string {
    const library = (h5pJson.preloadedDependencies || []).find(
        (dependency) => dependency.machineName === h5pJson.mainLibrary
    );
    if (!library) {
        return '';
    }
    return H5P.LibraryName.toUberName(library, { useWhitespace: true });
}
