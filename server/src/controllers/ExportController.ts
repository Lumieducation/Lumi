import fsExtra from 'fs-extra';
import _path from 'path';
import {
    H5PEditor,
    ITranslationFunction,
    IUser
} from '@lumieducation/h5p-server';
import HtmlExporter from '@lumieducation/h5p-html-exporter';
import promisePipe from 'promisepipe';
import { withDir } from 'tmp-promise';
import scopackager from 'simple-scorm-packager';
import i18next from 'i18next';
import reporterTemplate from './templates/reporter';
import scormTemplate from './templates/scorm';
import simpleTemplate from './templates/simple';

const t = i18next.getFixedT(null, 'lumi');

const cleanAndTrim = (text: string): string => {
    const textClean = text.replace(/[^a-zA-Z\d\s]/g, '');
    return textClean.replace(/\s/g, '');
};

/**
 * Creates a SCORM package.
 */
async function exportScorm(
    htmlExporter: HtmlExporter,
    h5pEditor: H5PEditor,
    path: string,
    contentId: string,
    user: IUser,
    options: { language: string; masteryScore: number; showRights: boolean }
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
                    user,
                    undefined,
                    {
                        language: options.language,
                        showFrame: options.showRights,
                        showLicenseButton: options.showRights
                    }
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
                    const opt = {
                        version: '1.2',
                        organization:
                            contentMetadata.authors &&
                            contentMetadata.authors[0]
                                ? contentMetadata.authors[0].name
                                : t('editor.exportDialog.defaults.authorName'),
                        title:
                            contentMetadata.title ||
                            t('editor.exportDialog.defaults.title'),
                        language: contentMetadata.defaultLanguage || 'en',
                        identifier: '00',
                        masteryScore: options.masteryScore,
                        startingPage: 'index.html',
                        source: tmpDir,
                        package: {
                            version: '1.0.0',
                            zip: true,
                            outputFolder: _path.dirname(path),
                            date: new Date().toISOString().slice(0, 10)
                        }
                    };
                    scopackager(opt, () => {
                        resolve(
                            `${cleanAndTrim(opt.title)}_v${
                                opt.package.version
                            }_${opt.package.date}.zip`
                        );
                    });
                }
            );
            try {
                await fsExtra.rename(
                    _path.join(_path.dirname(path), temporaryFilename),
                    path
                );
            } catch (error: any) {
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
    h5pEditor: H5PEditor,
    path: string,
    contentId: string,
    user: IUser,
    options: { language: string; showEmbed: boolean; showRights: boolean }
): Promise<void> {
    const dir = _path.dirname(path);
    const basename = _path.basename(path, '.html');

    const { html, contentFiles } =
        await htmlExporter.createBundleWithExternalContentResources(
            contentId,
            user,
            basename,
            {
                language: options.language,
                showEmbedButton: options.showEmbed,
                showLicenseButton: options.showRights,
                showFrame: options.showEmbed || options.showRights
            }
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

/**
 * Exports the content with the contentId to the requested export format.
 * @param filePath
 * @param h5pEditor
 * @param translationFunction
 * @param contentId
 * @param user
 * @param language
 * @param options
 */
export async function exportH5P(
    filePath: string,
    h5pEditor: H5PEditor,
    translationFunction: ITranslationFunction,
    contentId: string,
    user: IUser,
    language: string,
    options: {
        cssPath?: string;
        format: 'bundle' | 'external' | 'scorm';
        includeReporter: boolean;
        marginX: number;
        marginY: number;
        masteryScore: number;
        maxWidth: number;
        restrictWidthAndCenter: boolean;
        showEmbed: boolean;
        showRights: boolean;
    }
): Promise<void> {
    let customCss: string;
    try {
        customCss = options.cssPath
            ? await fsExtra.readFile(options.cssPath, 'utf-8')
            : undefined;
    } catch {
        // Read error from file; don't include CSS and silently ignore for the
        // moment
    }

    const htmlExporter = new HtmlExporter(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        h5pEditor.config,
        `${__dirname}/../../../h5p/core`,
        `${__dirname}/../../../h5p/editor`,
        options.includeReporter && options.format !== 'scorm'
            ? reporterTemplate
            : options.format === 'scorm'
            ? scormTemplate(
                  options.marginX,
                  options.marginY,
                  options.restrictWidthAndCenter ? options.maxWidth : undefined,
                  customCss
              )
            : simpleTemplate(
                  options.marginX,
                  options.marginY,
                  options.restrictWidthAndCenter ? options.maxWidth : undefined,
                  customCss
              ),
        translationFunction
    );

    if (options.format === 'bundle') {
        const html = await htmlExporter.createSingleBundle(contentId, user, {
            language,
            showEmbedButton: options.showEmbed,
            showFrame: options.showEmbed || options.showRights,
            showLicenseButton: options.showRights
        });
        await fsExtra.writeFile(filePath, html);
    } else if (options.format === 'external') {
        await exportHtmlExternal(
            htmlExporter,
            h5pEditor,
            filePath,
            contentId,
            user,
            {
                language,
                showRights: options.showRights,
                showEmbed: options.showEmbed
            }
        );
    } else if (options.format === 'scorm') {
        await exportScorm(htmlExporter, h5pEditor, filePath, contentId, user, {
            language,
            showRights: options.showRights,
            masteryScore: options.masteryScore
        });
    }
}
