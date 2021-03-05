import express, { response } from 'express';
import fsExtra from 'fs-extra';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import IServerConfig from '../IServerConfig';
import { dialog } from 'electron';
import User from '../User';
import fs from 'fs-extra';
import path from 'path';
import superagent from 'superagent';

import * as H5P from '@lumieducation/h5p-server';
import HtmlExporter from '@lumieducation/h5p-html-exporter';
import SocketIO from 'socket.io';

import { io as websocket } from '../websocket';

import createReporter from '../helpers/createRepoter';

export default function (
    serverConfig: IServerConfig,
    h5pEditor: H5P.H5PEditor,
    websocket_: SocketIO.Server
): express.Router {
    const router = express.Router();
    router.get(
        `/`,
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const run = await fsExtra.readJSON(serverConfig.runFile);

                res.status(200).json(run);
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

    router.patch(
        '/',
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                if (req.body) {
                    await fsExtra.readJSON(serverConfig.runFile);

                    await fsExtra.writeJSON(serverConfig.runFile, req.body);

                    res.status(200).json(req.body);
                }
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
    );

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
                const { filePaths } = await dialog.showOpenDialog({
                    filters: [
                        {
                            extensions: ['h5p'],
                            name: 'HTML 5 Package'
                        }
                    ],
                    properties: ['openFile']
                });

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
                const includeReporter = true; //= req.query.includeReporter === 'true';

                const reporterClient = await fsExtra.readFileSync(
                    `${__dirname}/../../../reporter-client/build/static/js/2.chunk.js`,
                    {
                        encoding: 'utf-8'
                    }
                );

                const reporterMain = await fsExtra.readFileSync(
                    `${__dirname}/../../../reporter-client/build/static/js/main.chunk.js`,
                    {
                        encoding: 'utf-8'
                    }
                );

                const htmlExporter = new HtmlExporter(
                    h5pEditor.libraryStorage,
                    h5pEditor.contentStorage,
                    h5pEditor.config,
                    `${__dirname}/../../../h5p/core`,
                    `${__dirname}/../../../h5p/editor`,
                    includeReporter
                        ? (
                              integration: string,
                              scriptsBundle: string,
                              stylesBundle: string,
                              contentId: string
                          ) => `<!doctype html>
                    <html class="h5p-iframe">
                    <head>
                        <meta charset="utf-8">                    
                        <script>H5PIntegration = ${integration};
                        ${scriptsBundle}</script>
                        <style>${stylesBundle}</style>
                    </head>
                    <body>
                    <div id="root"></div>
                    ${createReporter(reporterClient, reporterMain)}
                        <div style="margin: 20px auto; padding: 20px;  max-width: 840px; box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)" class="h5p-content lag" data-content-id="${contentId}"></div>                
                    </body>
                    </html>`
                        : undefined
                );

                const html = await htmlExporter.createSingleBundle(
                    contentId,
                    new User()
                );

                htmlFilePath = path.join(
                    serverConfig.workingCachePath,
                    `${contentId}.html`
                );
                await fsExtra.writeFileSync(htmlFilePath, html);

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
                const response = await superagent
                    .post('http://lumi.run')
                    .set('x-auth', 'c598f9799dfa05ea02156f847530fbea')
                    .attach('content', htmlFilePath)
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

                const newEntry = {
                    title: meta.title,
                    mainLibrary: meta.mainLibrary,
                    id: response.body.id,
                    secret: response.body.secret
                };

                run = await fs.readJSON(serverConfig.runFile);
                run.runs = [...run.runs, newEntry];
                await fs.writeJSON(serverConfig.runFile, run);

                await fs.remove(htmlFilePath);
                await fs.remove(
                    path.join(serverConfig.workingCachePath, `${contentId}`)
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

    router.delete(
        '/:id',
        async (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            try {
                const response = await superagent.delete(
                    `http://lumi.run/${req.params.id}?secret=${req.query.secret}`
                );

                const run = await fs.readJSON(serverConfig.runFile);
                run.runs = run.runs.filter((r) => r.id !== req.params.id);
                await fs.writeJSON(serverConfig.runFile, run);

                res.status(200).json(response);
            } catch (error) {
                Sentry.captureException(error);
                res.status(500).end();
            }
        }
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
