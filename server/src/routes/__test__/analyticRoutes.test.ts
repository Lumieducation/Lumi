import request from 'supertest';
import bootApp from '../../boot/app';
import path from 'path';
import { dialog } from 'electron';
import express from 'express';

describe('[analytics:routes]: GET /api/v1/analytics', () => {
    let app: express.Application;

    beforeAll(async () => {
        app = await bootApp({
            cache: path.resolve('test', 'data'),
            configFile: path.resolve('test', 'data', 'config.json'),
            librariesPath: path.resolve('test', 'data', `libraries`),
            temporaryStoragePath: path.resolve('test', 'data', 'tmp'),
            workingCachePath: path.resolve('test', 'data', 'workingCache')
        });

        return app;
    });
    it('should return the correct data when a folder is selected', async (done) => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [path.resolve('test', 'data', 'analytics', 'valid')]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toStrictEqual({
            interactions: [{ name: 'H5P.MultiChoice 1.14', id: 'skip' }],
            users: [
                {
                    name: 'test',
                    id: '43ce1094-a6e0-43f8-9368-5aac8352c357',
                    results: [1]
                }
            ]
        });
        done();
    });

    it('should return 499 if canceled', async (done) => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: true,
                filePaths: []
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(499);
        done();
    });

    it('should return 404 if no valid data was found', async (done) => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [path.resolve('electron')]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(404);

        done();
    });

    it('should return 500 if invalid data was found', async (done) => {
        dialog.showOpenDialog = jest.fn(async (c) => {
            return {
                canceled: false,
                filePaths: [
                    path.resolve('test', 'data', 'analytics', 'invalid')
                ]
            };
        });

        const res = await request(app).get('/api/v1/analytics');
        expect(res.statusCode).toEqual(500);

        done();
    });
});
