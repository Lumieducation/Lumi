import express from 'express';
import * as Sentry from '@sentry/node';
import { BrowserWindow, dialog } from 'electron';
import fsExtra from 'fs-extra';
import _path from 'path';
import * as H5P from '@lumieducation/h5p-server';
import {
    IRequestWithUser,
    IRequestWithLanguage
} from '@lumieducation/h5p-express';
import HtmlExporter from '@lumieducation/h5p-html-exporter';
import i18next from 'i18next';
import promisePipe from 'promisepipe';
import { withDir } from 'tmp-promise';
import scopackager from 'simple-scorm-packager';

import electronState from '../state/electronState';
import createReporter from '../helpers/createReporter';
import User from '../h5pImplementations/User';

const cleanAndTrim = (text) => {
    const textClean = text.replace(/[^a-zA-Z\d\s]/g, '');
    return textClean.replace(/\s/g, '');
};

const t = i18next.getFixedT(null, 'lumi');

const reporterTemplate = (
    integration: string,
    scriptsBundle: string,
    stylesBundle: string,
    contentId: string
) => {
    const reporterClient = fsExtra.readFileSync(
        `${__dirname}/../../../reporter-client/build/static/js/2.chunk.js`,
        {
            encoding: 'utf-8'
        }
    );

    const reporterMain = fsExtra.readFileSync(
        `${__dirname}/../../../reporter-client/build/static/js/main.chunk.js`,
        {
            encoding: 'utf-8'
        }
    );

    return `<!doctype html>
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
</html>`;
};

const scormTemplate = (
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
  <script type="text/javascript" src="SCORM_API_wrapper.js"></script>
  <script type="text/javascript" src="h5p-adaptor.js"></script>
  <style>${stylesBundle}</style>
</head>
<body>
  <div class="h5p-content lag" data-content-id="${contentId}"></div>                
</body>
</html>`;

/**
 * @param h5pEditor
 * @param h5pPlayer
 * @param languageOverride the language to use. Set it to 'auto' to use the
 * language set by a language detector in the req.language property.
 * (recommended)
 */
export default function (
    h5pEditor: H5P.H5PEditor,
    h5pPlayer: H5P.H5PPlayer,
    languageOverride: string | 'auto' = 'auto',
    browserWindow: BrowserWindow
): express.Router {
    const router = express.Router();

    router.get(`/:contentId/play`, async (req, res) => {
        try {
            const content = (await h5pPlayer.render(
                req.params.contentId,
                new User()
            )) as H5P.IPlayerModel;
            // We override the embed types to make sure content always resizes
            // properly.
            content.embedTypes = ['iframe'];
            res.send(content);
            res.status(200).end();
        } catch (error) {
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
                }
            > & { user: H5P.IUser },
            res
        ) => {
            const includeReporter = req.query.includeReporter === 'true';
            const format: 'bundle' | 'external' | 'scorm' = req.query.format;
            const expectedExtension = format === 'scorm' ? 'zip' : 'html';

            const result = await dialog.showSaveDialog(browserWindow, {
                defaultPath: `.${expectedExtension}`,
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
            let path = result.filePath;

            try {
                electronState.setState({ blockKeyboard: true });

                let actualExtension = _path.extname(path);
                if (actualExtension !== `.${expectedExtension}`) {
                    path = `${path}.${expectedExtension}`;
                    actualExtension = `.${expectedExtension}`;
                }

                const htmlExporter = new HtmlExporter(
                    h5pEditor.libraryStorage,
                    h5pEditor.contentStorage,
                    h5pEditor.config,
                    `${__dirname}/../../../h5p/core`,
                    `${__dirname}/../../../h5p/editor`,
                    includeReporter && format !== 'scorm'
                        ? reporterTemplate
                        : format === 'scorm'
                        ? scormTemplate
                        : undefined
                );

                if (format === 'bundle') {
                    const html = await htmlExporter.createSingleBundle(
                        req.params.contentId,
                        req.user
                    );
                    await fsExtra.writeFile(path, html);
                } else if (format === 'external') {
                    await exportHtmlExternal(
                        htmlExporter,
                        h5pEditor,
                        path,
                        req.params.contentId,
                        req.user
                    );
                } else if (format === 'scorm') {
                    await exportScorm(
                        htmlExporter,
                        h5pEditor,
                        path,
                        req.params.contentId,
                        req.user,
                        {
                            masteryScore: Number.parseFloat(
                                req.query.masteryScore
                            )
                        }
                    );
                }
            } catch (error) {
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
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof H5P.H5pError) {
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
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof H5P.H5pError) {
                res.status(error.httpStatusCode).send(error.message).end();
            }
        }
    });

    router.delete('/:contentId', async (req: IRequestWithUser, res) => {
        try {
            await h5pEditor.deleteContent(req.params.contentId, req.user);
        } catch (error) {
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
        // TODO: check access permissions

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

/**
 * Creates a SCORM package.
 */
async function exportScorm(
    htmlExporter: HtmlExporter,
    h5pEditor: H5P.H5PEditor,
    path: string,
    contentId: string,
    user: H5P.IUser,
    scormOptions: { masteryScore: number }
): Promise<void> {
    await withDir(
        async ({ path: tmpDir }) => {
            await fsExtra.copyFile(
                `${__dirname}/../../../scorm-client/h5p-adaptor.js`,
                _path.join(tmpDir, 'h5p-adaptor.js')
            );
            await fsExtra.copyFile(
                `${__dirname}/../../../scorm-client/SCORM_API_wrapper.js`,
                _path.join(tmpDir, 'SCORM_API_wrapper.js')
            );

            const { html, contentFiles } =
                await htmlExporter.createBundleWithExternalContentResources(
                    contentId,
                    user
                );
            await fsExtra.writeFile(_path.join(tmpDir, 'index.html'), html);
            for (const filename of contentFiles) {
                const fn = _path.join(tmpDir, filename);
                await fsExtra.mkdirp(_path.dirname(fn));
                const outputStream = fsExtra.createWriteStream(fn, {
                    autoClose: true
                });
                await promisePipe(
                    await h5pEditor.contentStorage.getFileStream(
                        contentId,
                        filename,
                        user
                    ),
                    outputStream
                );
                outputStream.close();
            }

            const contentMetadata =
                await h5pEditor.contentManager.getContentMetadata(
                    contentId,
                    user
                );

            const temporaryFilename = await new Promise<string>(
                (resolve, reject) => {
                    const options = {
                        version: '1.2',
                        organization:
                            contentMetadata.authors &&
                            contentMetadata.authors[0]
                                ? contentMetadata.authors[0].name
                                : t('editor.exportDialog.defaults.authorName'),
                        title:
                            contentMetadata.title ||
                            t('editor.exportDialog.defaults.title'),
                        language: contentMetadata.language || 'en-EN',
                        identifier: '00',
                        masteryScore: scormOptions.masteryScore,
                        startingPage: 'index.html',
                        source: tmpDir,
                        package: {
                            version: '1.0.0',
                            zip: true,
                            outputFolder: _path.dirname(path),
                            date: new Date().toISOString().slice(0, 10)
                        }
                    };
                    scopackager(options, () => {
                        resolve(
                            `${cleanAndTrim(options.title)}_v${
                                options.package.version
                            }_${options.package.date}.zip`
                        );
                    });
                }
            );
            try {
                await fsExtra.rename(
                    _path.join(_path.dirname(path), temporaryFilename),
                    path
                );
            } catch (error) {
                await fsExtra.remove(temporaryFilename);
            }
        },
        {
            keep: false,
            unsafeCleanup: true
        }
    );
}

/**
 * Exports the content to a HTML file and stores media resources in extra files.
 */
async function exportHtmlExternal(
    htmlExporter: HtmlExporter,
    h5pEditor: H5P.H5PEditor,
    path: string,
    contentId: string,
    user: H5P.IUser
): Promise<void> {
    const dir = _path.dirname(path);
    const basename = _path.basename(path, '.html');

    const { html, contentFiles } =
        await htmlExporter.createBundleWithExternalContentResources(
            contentId,
            user,
            basename
        );
    await fsExtra.writeFile(path, html);
    for (const filename of contentFiles) {
        const fn = _path.join(dir, basename, filename);
        await fsExtra.mkdirp(_path.dirname(fn));
        const outputStream = fsExtra.createWriteStream(fn, {
            autoClose: true
        });
        await promisePipe(
            await h5pEditor.contentStorage.getFileStream(
                contentId,
                filename,
                user
            ),
            outputStream
        );
        outputStream.close();
    }
}
