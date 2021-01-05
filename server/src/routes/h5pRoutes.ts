import express from 'express';

import { dialog } from 'electron';

import fsExtra from 'fs-extra';

import * as H5P from '@lumieducation/h5p-server';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@lumieducation/h5p-server/build/src/adapters/expressTypes';

/**
 * @param h5pEditor
 * @param h5pPlayer
 * @param languageOverride the language to use. Set it to 'auto' to use the
 * language set by a language detector in the req.language property.
 * (recommended)
 */
export default function(
    h5pEditor: H5P.H5PEditor,
    h5pPlayer: H5P.H5PPlayer,
    languageOverride: string | 'auto' = 'auto'
): express.Router {
    const router = express.Router();

    router.get(`/:contentId/play`, async (req, res) => {
        try {
            const content = await h5pPlayer.render(req.params.contentId);
            res.send(content);
            res.status(200).end();
        } catch (error) {
            res.status(500).end(error.message);
        }
    });

    const htmlExporter = new H5P.HtmlExporter(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        h5pEditor.config,
        `${__dirname}/../../../h5p/core`,
        `${__dirname}/../../../h5p/editor`
    );

    router.get(`/:contentId/html`, async (req: IRequestWithUser, res) => {
        const path = dialog.showSaveDialogSync({
            defaultPath: '',
            filters: [
                {
                    extensions: ['html'],
                    name: 'Export H5P as html'
                }
            ],
            title: 'Export H5P as html'
        });

        const html = await htmlExporter.createSingleBundle(
            req.params.contentId,
            req.user
        );

        try {
            await fsExtra.writeFileSync(path, html);
        } catch (error) {
            return res.status(500).end();
        }

        res.status(200).end();
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
                : languageOverride
        )) as H5P.IEditorModel;
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
            res.status(400)
                .send('Malformed request')
                .end();
            return;
        }
        const {
            id: contentId,
            metadata
        } = await h5pEditor.saveOrUpdateContentReturnMetaData(
            undefined,
            req.body.params.params,
            req.body.params.metadata,
            req.body.library,
            req.user
        );

        res.send(JSON.stringify({ contentId, metadata }));
        res.status(200).end();
    });

    router.patch('/:contentId', async (req: IRequestWithUser, res) => {
        if (
            !req.body.params ||
            !req.body.params.params ||
            !req.body.params.metadata ||
            !req.body.library ||
            !req.user
        ) {
            res.status(400)
                .send('Malformed request')
                .end();
            return;
        }
        const {
            id: contentId,
            metadata
        } = await h5pEditor.saveOrUpdateContentReturnMetaData(
            req.params.contentId.toString(),
            req.body.params.params,
            req.body.params.metadata,
            req.body.library,
            req.user
        );

        res.send(JSON.stringify({ contentId, metadata }));
        res.status(200).end();
    });

    router.delete('/:contentId', async (req: IRequestWithUser, res) => {
        try {
            await h5pEditor.deleteContent(req.params.contentId, req.user);
        } catch (error) {
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
        // TODO: check access permissions

        const contentIds = await h5pEditor.contentManager.listContent();
        const contentObjects = await Promise.all(
            contentIds.map(async id => ({
                id,
                content: await h5pEditor.contentManager.getContentMetadata(
                    id,
                    req.user
                )
            }))
        );

        res.status(200).send(
            contentObjects.map(o => {
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
