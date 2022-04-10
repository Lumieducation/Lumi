import request from 'supertest';
import createExpressApp from '../../boot/expressApp';
import path from 'path';
import express from 'express';
import fsExtra from 'fs-extra';
import { dialog, BrowserWindow, MessageBoxOptions } from 'electron';

import SettingsCache from '../../config/SettingsCache';
import initI18n from '../../boot/i18n';
import StateStorage from '../../state/electronState';
import FilePickerMock from './FilePickerMock';
import FileHandleManager from '../../state/FileHandleManager';
import { initH5P } from '../../boot/h5p';

describe('GET /settings', () => {
    let app: express.Application;

    beforeAll(async () => {
        const settingsCache = new SettingsCache(
            path.resolve('test', 'data', 'settings.json')
        );
        const paths = {
            contentTypeCache: path.resolve('test', 'data'),
            librariesPath: path.resolve('test', 'data', 'libraries'),
            temporaryStoragePath: path.resolve('test', 'data', 'tmp'),
            contentStoragePath: path.resolve('test', 'data', 'workingCache'),
            settingsFile: path.resolve('test', 'data', 'settings.json')
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

    it('should return the settings', async () => {
        const settings = fsExtra.readJSON(
            path.resolve('test', 'data', 'settings.json')
        );
        const res = await request(app).get('/api/v1/settings');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(settings);
    });
});

describe('PATCH /settings', () => {
    let app: express.Application;

    beforeAll(async () => {
        const settingsCache = new SettingsCache(
            path.resolve('test', 'data', 'settings.json')
        );
        const paths = {
            contentTypeCache: path.resolve('test', 'data'),
            librariesPath: path.resolve('test', 'data', 'libraries'),
            temporaryStoragePath: path.resolve('test', 'data', 'tmp'),
            contentStoragePath: path.resolve('test', 'data', 'workingCache'),
            settingsFile: path.resolve('test', 'data', 'settings.json')
        };
        const t = await initI18n(settingsCache);
        const { h5pEditor, h5pPlayer } = await initH5P(paths, t, settingsCache);
        app = await createExpressApp(
            h5pEditor,
            h5pPlayer,
            paths,
            null,
            settingsCache,
            t,
            new StateStorage(),
            new FilePickerMock(),
            new FileHandleManager()
        );

        return app;
    });
    it('should update the settings', async () => {
        dialog.showMessageBox = (async (
            browserWindow: BrowserWindow,
            options: MessageBoxOptions
        ) => {
            return {
                response: 1,
                checkboxChecked: false,
                checkboxLabel: false
            };
        }) as any;

        const settings = await fsExtra.readJSON(
            path.resolve('test', 'data', 'settings.json')
        );

        const updatedSettings = {
            ...settings,
            test: 'abc'
        };
        const res = await request(app)
            .patch('/api/v1/settings')
            .send(updatedSettings);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toStrictEqual(updatedSettings);

        expect(
            await fsExtra.readJSON(
                path.resolve('test', 'data', 'settings.json')
            )
        ).toStrictEqual(updatedSettings);
    });
});
