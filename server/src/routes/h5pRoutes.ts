import express from 'express';
import * as Sentry from '@sentry/node';
import _path from 'path';
import {
    H5PEditor,
    H5pError,
    H5PPlayer,
    IEditorModel,
    IPlayerModel
} from '@lumieducation/h5p-server';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@lumieducation/h5p-express';
import i18next from 'i18next';

import User from '../h5pImplementations/User';
import H5PController from '../controllers/H5PController';
import IServerConfig from '../config/IPaths';
import Logger from '../helpers/Logger';

const t = i18next.getFixedT(null, 'lumi');

const log = new Logger('routes:h5p');

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
    serverConfig: IServerConfig,
    languageOverride: string | 'auto' = 'auto'
): express.Router {
    const router = express.Router();

    const h5pController = new H5PController(h5pEditor, serverConfig);

    router.get(
        '/:contentId/data',
        async (req: express.Request, res: express.Response) => {
            const { contentId } = req.params;
            try {
                const content = await this.h5pEditor.getContent(contentId);
                log.info(`sending package data for contentId ${contentId}`);
                res.status(200).json(content);
            } catch (error: any) {
                Sentry.captureException(error);
                log.warn(error);
                res.status(404).end();
            }
        }
    );

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

            res.json({ contentId, metadata });
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

    router.delete(
        '/:contentId',
        async (
            req: express.Request<{ contentId: string }>,
            res: express.Response,
            next: express.NextFunction
        ) => {
            const contentId = req.params.contentId;
            h5pController
                // the cast assumes we don't get arrays of complex objects from
                // the client
                .delete(contentId as string)
                .then((result) => {
                    res.status(200).json(result);
                })
                .catch((error) => {
                    Sentry.captureException(error);
                    next(error);
                });
        }
    );

    return router;
}
