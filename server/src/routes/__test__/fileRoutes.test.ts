import request from 'supertest';
import createExpressApp from '../../boot/expressApp';
import path from 'path';
import { dialog } from 'electron';
import express from 'express';
import fsExtra from 'fs-extra';

import SettingsCache from '../../config/SettingsCache';
import initI18n from '../../boot/i18n';
import StateStorage from '../../state/electronState';
import FileHandleManager from '../../state/FileHandleManager';
import FilePickerMock from './FilePickerMock';
import { initH5P } from '../../boot/h5p';

describe('[export h5p as html]: GET /api/v1/files/export', () => {
    let app: express.Application;

    beforeAll(async () => {
        const settingsCache = new SettingsCache(
            path.join(__dirname, '../../../../test/data/settings.json')
        );
        const paths = {
            contentTypeCache: path.resolve('test', 'data'),
            librariesPath: path.resolve('test', 'data', 'libraries'),
            temporaryStoragePath: path.resolve('test', 'data', 'tmp'),
            contentStoragePath: path.resolve('test', 'data', 'workingCache'),
            settingsFile: path.join(
                __dirname,
                '../../../../test/data/settings.json'
            )
        };
        const t = await initI18n(settingsCache);
        const { h5pEditor, h5pPlayer } = await initH5P(paths, t, settingsCache);
        app = await createExpressApp(
            h5pEditor,
            h5pPlayer,
            paths,
            () => null,
            settingsCache,
            t,
            new StateStorage(),
            new FilePickerMock(),
            new FileHandleManager()
        );

        return app;
    });

    it('exports a html file', async () => {
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
            `/api/v1/files/export?contentId=${contentId}&format=bundle`
        );
        expect(res.statusCode).toEqual(200);

        expect(await fsExtra.stat(outputPath)).toBeTruthy();

        fsExtra.removeSync(outputPath);
    }, 30000);

    it('appends .html if no extension is defined', async () => {
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
            `/api/v1/files/export?contentId=${contentId}&format=bundle`
        );
        expect(res.statusCode).toEqual(200);

        expect(await fsExtra.stat(outputPath)).toBeTruthy();

        fsExtra.removeSync(outputPath);
    }, 30000);

    it('returns 499 if canceled by user', async () => {
        dialog.showSaveDialog = jest.fn(async (c) => ({
            canceled: true,
            filePath: undefined
        }));

        const contentId = 740522043;

        const res = await request(app).get(
            `/api/v1/files/export?contentId=${contentId}&format=bundle`
        );
        expect(res.statusCode).toEqual(499);
    }, 30000);
});
