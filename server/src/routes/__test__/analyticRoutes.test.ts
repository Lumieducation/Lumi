import request from 'supertest';
import bootApp from '../../boot/expressApp';
import path from 'path';
import { dialog } from 'electron';
import express from 'express';

import SettingsCache from '../../config/SettingsCache';
import initI18n from '../../boot/i18n';
import StateStorage from '../../state/electronState';
import FilePickerMock from './FilePickerMock';
import FileHandleManager from '../../state/FileHandleManager';
import { initH5P } from '../../boot/h5p';

describe('[analytics:routes]: GET /api/v1/analytics', () => {
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
        app = await bootApp(
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

    it('should return an json-prase-error when the file is not parseable', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve(
                        'test',
                        'data',
                        'analytics',
                        'invalid',
                        'not-parseable'
                    )
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].code).toBe('json-parse-error');
    });

    it('should contain the filename as namefield without extension', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve(
                        'test',
                        'data',
                        'analytics',
                        'valid-interactions'
                    )
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].name).toBe('test-interactions');
    });

    it('should contain the objectHash of the content', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve('test', 'data', 'analytics', 'valid.test')
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].contentHash).toBe(
            '6ae0f6934e4f016496092127436c5ad8c8f7744b'
        );
    });

    it('should contain a no-content-json error when there is no contentJson', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve(
                        'test',
                        'data',
                        'analytics',
                        'invalid',
                        'no-content-json'
                    )
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].code).toBe('no-content-json');
    });

    it('should contain the interactions of the content type', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve(
                        'test',
                        'data',
                        'analytics',
                        'valid-interactions'
                    )
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].interactions).toStrictEqual([
            {
                id: '55784d45-214a-4e31-8333-57392e4cf1c9',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 1'
            },
            {
                id: 'c998638b-03c6-4ed4-b907-6fe374a3eb52',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 2'
            },
            {
                id: 'e6836c1b-4ab1-4ddd-9dae-6b8fc9d0194f',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 3'
            },
            {
                id: 'c0ceabb0-c3c6-4a25-89a7-05481ca1e7a4',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 4'
            },
            {
                id: '720b5a91-5c78-4523-ac26-81c24fb4e101',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 5'
            },
            {
                id: 'd790ceb0-2f3f-4bd0-8ca2-43d1278b77e3',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 6'
            },
            {
                id: '474b4fa0-2dec-4de7-8bd4-32065a14e247',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 7'
            },
            {
                id: 'e619ae7a-9855-4437-87b9-b4e66496e969',
                name: 'MultiChoice',
                title: 'Kern- und Halbschatten 8'
            }
        ]);
    });

    it('should contain the results of the user from the statements', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve(
                        'test',
                        'data',
                        'analytics',
                        'valid-interactions'
                    )
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].results).toStrictEqual([1, 1, 1, 1, 0, 1, 1, 0]);
    });

    it('should return 499 if canceled', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: true,
                filePaths: []
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(499);
    });

    it('should return 404 if no valid data was found', async () => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [path.resolve('electron')]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(404);
    });
});
