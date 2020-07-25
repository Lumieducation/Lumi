import * as H5P from 'h5p-nodejs-library';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';

import h5pConfig from '../../config/h5pConfig';
import routes from '../routes';
import DirectoryTemporaryFileStorage from '../h5pImplementations/DirectoryTemporaryFileStorage';
import JsonStorage from '../h5pImplementations/JsonStorage';
import IServerConfig from '../../config/IServerConfig';

export default (serverConfig: IServerConfig) => {
    const h5pEditor = new H5P.H5PEditor(
        new JsonStorage(serverConfig.cache),
        new H5P.H5PConfig(
            new H5P.fsImplementations.InMemoryStorage(),
            new H5P.H5PConfig(
                new H5P.fsImplementations.InMemoryStorage(),
                h5pConfig
            )
        ),
        new H5P.fsImplementations.FileLibraryStorage(
            serverConfig.librariesPath
        ),
        new H5P.fsImplementations.FileContentStorage(
            serverConfig.workingCachePath
        ),
        new DirectoryTemporaryFileStorage(serverConfig.temporaryStoragePath)
    );

    const app = express();
    app.use(Sentry.Handlers.requestHandler());

    app.use(bodyParser.json({ limit: h5pConfig.maxTotalSize }));
    app.use(
        bodyParser.urlencoded({
            extended: true,
            limit: h5pConfig.maxTotalSize
        })
    );

    app.use(
        fileUpload({
            limits: { fileSize: h5pConfig.maxTotalSize }
        })
    );

    app.use('/', routes(h5pEditor));

    app.use(Sentry.Handlers.errorHandler());

    app.use((error, req, res, next) => {
        Sentry.captureException(error);
        res.status(error.status || 500).json({
            code: error.code,
            message: error.message,
            status: error.status
        });
    });
    return app;
};
