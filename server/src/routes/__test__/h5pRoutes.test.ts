import request from 'supertest';
import bootApp from '../../boot/app';
import path from 'path';
import { dialog } from 'electron';
import express from 'express';
import fsExtra from 'fs-extra';

describe('[export h5p as html]: GET /api/v1/h5p/:contentId/html', () => {
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

    it('exports a html file', async (done) => {
        dialog.showSaveDialog = jest.fn(async (c) => ({
            canceled: false,
            filePath: path.resolve('test', 'build', 'test.html')
        }));

        const contentId = 740522043;

        const res = await request(app).get(
            `/api/v1/h5p/${contentId}/export?format=bundle`
        );
        expect(res.statusCode).toEqual(200);

        expect(
            await fsExtra.stat(path.resolve('test', 'build', 'test.html'))
        ).toBeTruthy();

        fsExtra.removeSync(path.resolve('test', 'build', 'test.html'));

        done();
    }, 30000);

    it('appends .html if no extension is defined', async (done) => {
        dialog.showSaveDialog = jest.fn(async (c) => ({
            canceled: false,
            filePath: path.resolve('test', 'build', 'test2')
        }));

        const contentId = 740522043;

        const res = await request(app).get(
            `/api/v1/h5p/${contentId}/export?format=bundle`
        );
        expect(res.statusCode).toEqual(200);

        expect(
            await fsExtra.stat(path.resolve('test', 'build', 'test2.html'))
        ).toBeTruthy();

        fsExtra.removeSync(path.resolve('test', 'build', 'test2.html'));

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
