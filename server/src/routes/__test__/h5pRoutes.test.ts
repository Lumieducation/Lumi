import request from 'supertest';
import bootApp from '../../boot/expressApp';
import path from 'path';
import { dialog } from 'electron';
import express from 'express';
import fsExtra from 'fs-extra';

import SettingsCache from '../../config/SettingsCache';
import initI18n from '../../boot/i18n';

describe('[export h5p as html]: GET /api/v1/h5p/:contentId/html', () => {
    let app: express.Application;

    beforeAll(async () => {
        const settingsCache = new SettingsCache(
            path.join(__dirname, '../../../../test/data/settings.json')
        );
        app = await bootApp(
            {
                contentTypeCache: path.resolve('test', 'data'),
                librariesPath: path.resolve('test', 'data', 'libraries'),
                temporaryStoragePath: path.resolve('test', 'data', 'tmp'),
                contentStoragePath: path.resolve(
                    'test',
                    'data',
                    'workingCache'
                ),
                settingsFile: path.join(
                    __dirname,
                    '../../../../test/data/settings.json'
                )
            },
            null,
            settingsCache,
            await initI18n(settingsCache)
        );

        return app;
    });

    it('exports a html file', async (done) => {
        const outputPath = path.join(
            __dirname,
            '../../../../test/build/test.html'
        );
        dialog.showSaveDialog = jest.fn(async (c) => ({
            canceled: false,
            filePath: path.join(__dirname, '../../../../test/build/test.html')
        }));

        const contentId = 740522043;

        const res = await request(app).get(
            `/api/v1/h5p/${contentId}/export?format=bundle`
        );
        expect(res.statusCode).toEqual(200);

        expect(await fsExtra.stat(outputPath)).toBeTruthy();

        fsExtra.removeSync(outputPath);

        done();
    }, 30000);

    it('appends .html if no extension is defined', async (done) => {
        const outputPath = path.join(
            __dirname,
            '../../../../test/build/test2.html'
        );
        dialog.showSaveDialog = jest.fn(async (c) => ({
            canceled: false,
            filePath: outputPath
        }));

        const contentId = 740522043;

        const res = await request(app).get(
            `/api/v1/h5p/${contentId}/export?format=bundle`
        );
        expect(res.statusCode).toEqual(200);

        expect(await fsExtra.stat(outputPath)).toBeTruthy();

        fsExtra.removeSync(outputPath);

        done();
    }, 30000);

    it('returns 499 if canceled by user', async (done) => {
        dialog.showSaveDialog = jest.fn(async (c) => ({
            canceled: true,
            filePath: undefined
        }));

        const contentId = 740522043;

        const res = await request(app).get(
            `/api/v1/h5p/${contentId}/export?format=bundle`
        );
        expect(res.statusCode).toEqual(499);

        done();
    }, 30000);
});
