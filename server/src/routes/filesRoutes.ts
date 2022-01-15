import express from 'express';
import {
    H5PEditor,
    ITranslationFunction,
    IUser
} from '@lumieducation/h5p-server';
import * as Sentry from '@sentry/node';
import * as _path from 'path';
import i18next from 'i18next';

import Logger from '../helpers/Logger';
import { BrowserWindow, dialog } from 'electron';
import StateStorage from '../state/electronState';
import { IFilePickers } from '../types';
import FileHandleManager from '../state/FileHandleManager';
import { sanitizeFilename } from '../helpers/FilenameSanitizer';
import { exportH5P } from '../controllers/ExportController';
import FileController from '../controllers/FileController';

const t = i18next.getFixedT(null, 'lumi');

const log = new Logger('routes:file');

export default function (
    h5pEditor: H5PEditor,
    getBrowserWindow: () => BrowserWindow,
    electronState: StateStorage,
    filePickers: IFilePickers,
    fileHandleManager: FileHandleManager,
    translationFunction: ITranslationFunction
): express.Router {
    const router = express.Router();
    const fileController = new FileController(
        h5pEditor,
        getBrowserWindow,
        electronState,
        filePickers,
        fileHandleManager
    );

    router.get(
        '/pick_h5p_files',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            fileController
                .pickH5PFiles()
                .then((result) => {
                    if (result) {
                        res.status(200).json(result);
                    } else {
                        res.status(404).send();
                    }
                })
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    router.get(
        '/pick_css_file',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            fileController
                .pickCSSFile()
                .then((result) => {
                    if (result) {
                        res.status(200).json({
                            fileHandleId: result.fileHandle,
                            filename: _path.basename(result.path)
                        });
                    } else {
                        res.status(499).send();
                    }
                })
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    router.get(
        `/open`,
        (
            req: express.Request<{}, {}, {}, { fileHandleId: string }>,
            res: express.Response,
            next: express.NextFunction
        ) => {
            fileController
                .open(req.query.fileHandleId)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    router.post(
        `/save`,
        (
            req: express.Request<
                {},
                {},
                {},
                { contentId: string; fileHandleId: string }
            >,
            res: express.Response,
            next: express.NextFunction
        ) => {
            fileController
                // the casts assume we don't get arrays of complex objects from
                // the client
                .save(
                    req.query.contentId,
                    req.query.fileHandleId === 'undefined'
                        ? undefined
                        : req.query.fileHandleId
                )
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    log.error(`Error while saving H5P: ${error}`);
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    router.get(
        `/export`,
        async (
            req: express.Request<
                any,
                any,
                any,
                {
                    contentId: string;
                    cssFileHandleId?: string;
                    format: 'bundle' | 'external' | 'scorm';
                    includeReporter: string;
                    marginX: string;
                    marginY: string;
                    masteryScore: string;
                    maxWidth: string;
                    restrictWidthAndCenter: string;
                    showEmbed: string;
                    showRights: string;
                }
            > & { user: IUser },
            res
        ) => {
            const includeReporter = req.query.includeReporter === 'true';
            const format: 'bundle' | 'external' | 'scorm' = req.query.format;
            const expectedExtension = format === 'scorm' ? 'zip' : 'html';
            const showEmbed = req.query.showEmbed === 'true';
            const showRights = req.query.showRights === 'true';
            const marginX = Number.parseInt(req.query.marginX, 10);
            const marginY = Number.parseInt(req.query.marginY, 10);
            const restrictWidthAndCenter =
                req.query.restrictWidthAndCenter === 'true';
            const maxWidth = Number.parseInt(req.query.maxWidth, 10);
            const cssFileHandleId = req.query.cssFileHandleId;
            const cssPath = cssFileHandleId
                ? fileHandleManager.getById(cssFileHandleId)?.filename
                : undefined;

            const { params, h5p } = await h5pEditor.getContent(
                req.query.contentId,
                req.user
            );

            // using the path directly is safe, as it is not passed to the
            // client and sent back
            const result = await dialog.showSaveDialog(getBrowserWindow(), {
                defaultPath: _path.join(
                    electronState.getState().lastDirectory,
                    sanitizeFilename(
                        params.metadata.title,
                        t('edit.exportDialog.defaults.fileName')
                    ) ?? t('edit.exportDialog.defaults.fileName')
                ),
                filters: [
                    {
                        extensions: [expectedExtension],
                        name: t(
                            `editor.exportDialog.filePicker.formatNames.${format}`
                        )
                    }
                ],
                title: t('editor.exportDialog.filePicker.title'),
                buttonLabel: t('editor.exportDialog.filePicker.buttonLabel'),
                properties: ['showOverwriteConfirmation']
            });

            if (result.canceled) {
                return res.status(499).end();
            }
            let filePath = result.filePath;

            electronState.setState({ lastDirectory: _path.dirname(filePath) });

            let actualExtension = _path.extname(filePath);
            if (actualExtension !== `.${expectedExtension}`) {
                filePath = `${filePath}.${expectedExtension}`;
                actualExtension = `.${expectedExtension}`;
            }

            try {
                electronState.setState({ blockKeyboard: true });

                await exportH5P(
                    filePath,
                    h5pEditor,
                    translationFunction,
                    req.query.contentId,
                    req.user,
                    h5p.defaultLanguage,
                    {
                        format,
                        includeReporter,
                        marginX,
                        marginY,
                        maxWidth,
                        restrictWidthAndCenter,
                        showEmbed,
                        showRights,
                        cssPath,
                        masteryScore: Number.parseFloat(req.query.masteryScore)
                    }
                );
            } catch (error: any) {
                Sentry.captureException(error);
                res.status(500).json(error);
            } finally {
                electronState.setState({ blockKeyboard: false });
            }

            res.status(200).end();
        }
    );

    return router;
}
