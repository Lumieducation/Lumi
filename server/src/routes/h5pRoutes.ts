// file deepcode ignore NoRateLimitingForExpensiveWebOperation: No public API

import express from 'express';
import * as Sentry from '@sentry/node';
import { BrowserWindow, dialog } from 'electron';
import _path from 'path';
import {
    H5PEditor,
    H5pError,
    H5PPlayer,
    IEditorModel,
    IPlayerModel,
    ITranslationFunction,
    IUser
} from '@lumieducation/h5p-server';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@lumieducation/h5p-express';
import i18next from 'i18next';

import electronState from '../state/electronState';
import User from '../h5pImplementations/User';
import { sanitizeFilename } from '../helpers/FilenameSanitizer';
import { exportH5P } from '../controllers/ExportController';

const t = i18next.getFixedT(null, 'lumi');

/**
 * @param h5pEditor
 * @param h5pPlayer
 * @param languageOverride the language to use. Set it to 'auto' to use the
 * language set by a language detector in the req.language property.
 * (recommended)
 */
export default function (
    h5pEditor: H5PEditor,
    h5pPlayer: H5PPlayer,
    languageOverride: string | 'auto' = 'auto',
    browserWindow: BrowserWindow,
    translationFunction: ITranslationFunction
): express.Router {
    const router = express.Router();

    router.get(`/:contentId/play`, async (req, res) => {
        try {
            const content = (await h5pPlayer.render(
                req.params.contentId,
                new User()
            )) as IPlayerModel;
            // We override the embed types to make sure content always resizes
            // properly.
            content.embedTypes = ['iframe'];
            res.send(content);
            res.status(200).end();
        } catch (error: any) {
            Sentry.captureException(error);
            res.status(500).end(error.message);
        }
    });

    router.get(
        `/:contentId/export`,
        async (
            req: express.Request<
                { contentId: string },
                any,
                any,
                {
                    format: 'bundle' | 'external' | 'scorm';
                    includeReporter: string;
                    masteryScore: string;
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

            const { params, h5p } = await h5pEditor.getContent(
                req.params.contentId,
                req.user
            );
            const result = await dialog.showSaveDialog(browserWindow, {
                defaultPath:
                    sanitizeFilename(
                        params.metadata.title,
                        t('edit.exportDialog.defaults.fileName')
                    ) ?? t('edit.exportDialog.defaults.fileName'),
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
                    req.params.contentId,
                    req.user,
                    h5p.defaultLanguage,
                    {
                        format,
                        includeReporter,
                        showEmbed,
                        showRights,
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

    router.get('/:contentId/edit', async (req: IRequestWithLanguage, res) => {
        // This route merges the render and the /ajax/params routes to avoid a
        // second request.
        const editorModel = (await h5pEditor.render(
            req.params.contentId === 'undefined'
                ? undefined
                : req.params.contentId,
            languageOverride === 'auto'
                ? req.language ?? 'en'
                : languageOverride,
            new User()
        )) as IEditorModel;
        if (!req.params.contentId || req.params.contentId === 'undefined') {
            res.send(editorModel);
        } else {
            const content = await h5pEditor.getContent(req.params.contentId);
            res.send({
                ...editorModel,
                library: content.library,
                metadata: content.params.metadata,
                params: content.params.params
            });
        }
        res.status(200).end();
    });

    router.post('/', async (req: IRequestWithUser, res) => {
        if (
            !req.body.params ||
            !req.body.params.params ||
            !req.body.params.metadata ||
            !req.body.library ||
            !req.user
        ) {
            Sentry.captureMessage('Malformed request');
            res.status(400).send('Malformed request').end();
            return;
        }
        try {
            const { id: contentId, metadata } =
                await h5pEditor.saveOrUpdateContentReturnMetaData(
                    undefined,
                    req.body.params.params,
                    req.body.params.metadata,
                    req.body.library,
                    req.user
                );
            res.send(JSON.stringify({ contentId, metadata }));
            res.status(200).end();
        } catch (error: any) {
            Sentry.captureException(error);
            if (error instanceof H5pError) {
                res.status(error.httpStatusCode).send(error.message).end();
            }
        }
    });

    router.patch('/:contentId', async (req: IRequestWithUser, res) => {
        if (
            !req.body.params ||
            !req.body.params.params ||
            !req.body.params.metadata ||
            !req.body.library ||
            !req.user
        ) {
            res.status(400).send('Malformed request').end();
            return;
        }
        try {
            const { id: contentId, metadata } =
                await h5pEditor.saveOrUpdateContentReturnMetaData(
                    req.params.contentId.toString(),
                    req.body.params.params,
                    req.body.params.metadata,
                    req.body.library,
                    req.user
                );

            res.send(JSON.stringify({ contentId, metadata }));
            res.status(200).end();
        } catch (error: any) {
            Sentry.captureException(error);
            if (error instanceof H5pError) {
                res.status(error.httpStatusCode).send(error.message).end();
            }
        }
    });

    router.delete('/:contentId', async (req: IRequestWithUser, res) => {
        try {
            await h5pEditor.deleteContent(req.params.contentId, req.user);
        } catch (error: any) {
            Sentry.captureException(error);
            res.send(
                `Error deleting content with id ${req.params.contentId}: ${error.message}`
            );
            res.status(500).end();
            return;
        }

        res.send(`Content ${req.params.contentId} successfully deleted.`);
        res.status(200).end();
    });

    router.get('/', async (req: IRequestWithUser, res) => {
        const contentIds = await h5pEditor.contentManager.listContent();
        const contentObjects = await Promise.all(
            contentIds.map(async (id) => ({
                id,
                content: await h5pEditor.contentManager.getContentMetadata(
                    id,
                    req.user
                )
            }))
        );

        res.status(200).send(
            contentObjects.map((o) => {
                return {
                    contentId: o.id,
                    title: o.content.title,
                    mainLibrary: o.content.mainLibrary
                };
            })
        );
    });

    return router;
}
