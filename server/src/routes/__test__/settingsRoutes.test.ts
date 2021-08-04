import request from 'supertest';
import bootApp from '../../boot/app';
import path from 'path';
import express from 'express';
import fsExtra from 'fs-extra';
import { dialog, BrowserWindow, MessageBoxOptions } from 'electron';

import settingsCache from '../../settingsCache';

describe('GET /settings', () => {
    let app: express.Application;

    beforeAll(async () => {
        app = await bootApp(
            {
                cache: path.resolve('test', 'data'),
                configFile: path.resolve('test', 'data', 'config.json'),
                librariesPath: path.resolve('test', 'data', `libraries`),
                temporaryStoragePath: path.resolve('test', 'data', 'tmp'),
                contentStoragePath: path.resolve(
                    'test',
                    'data',
                    'workingCache'
                ),
                settingsFile: path.resolve('test', 'data', 'settings.json')
            },
            null
        );

        return app;
    });
    it('should return the settings', async (done) => {
        const settings = await fsExtra.readJSON(
            path.resolve('test', 'data', 'settings.json')
        );
        settingsCache.setSettings(settings);

        const res = await request(app).get('/api/v1/settings');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(settings);
        done();
    });
});

describe('PATCH /settings', () => {
    let app: express.Application;

    beforeAll(async () => {
        app = await bootApp(
            {
                cache: path.resolve('test', 'data'),
                configFile: path.resolve('test', 'data', 'config.json'),
                librariesPath: path.resolve('test', 'data', `libraries`),
                temporaryStoragePath: path.resolve('test', 'data', 'tmp'),

                contentStoragePath: path.resolve(
                    'test',
                    'data',
                    'workingCache'
                ),
                settingsFile: path.resolve('test', 'data', 'settings.json')
            },
            null
        );

        return app;
    });
    it('should update the settings', async (done) => {
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
        done();
    });
});
