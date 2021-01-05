import * as H5P from '@lumieducation/h5p-server';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';

import i18next from 'i18next';
import i18nextHttpMiddleware from 'i18next-http-middleware';
import i18nextFsBackend from 'i18next-fs-backend';

import routes from '../routes';

import IServerConfig from '../IServerConfig';

import createH5PEditor from './createH5PEditor';

import User from '../User';

export default async (serverConfig: IServerConfig) => {
    const translationFunction = await i18next
        .use(i18nextFsBackend)
        .use(i18nextHttpMiddleware.LanguageDetector) // This will add the
        // properties language and languages to the req object.
        // See https://github.com/i18next/i18next-http-middleware#adding-own-detection-functionality
        // how to detect language in your own fashion. You can also choose not
        // to add a detector if you only want to use one language.
        .init({
            backend: {
                loadPath:
                    'node_modules/@lumieducation/h5p-server/build/assets/translations/{{ns}}/{{lng}}.json'
            },
            debug: process.env.DEBUG && process.env.DEBUG.includes('i18n'),
            defaultNS: 'server',
            fallbackLng: 'en',
            ns: [
                'client',
                'copyright-semantics',
                'metadata-semantics',
                'mongo-s3-content-storage',
                's3-temporary-storage',
                'server',
                'storage-file-implementations'
            ],
            preload: ['en', 'de'] // If you don't use a language detector of
            // i18next, you must preload all languages you want to use!
        });

    const config = await new H5P.H5PConfig(
        new H5P.fsImplementations.JsonStorage(serverConfig.configFile)
    ).load();

    // The H5PEditor object is central to all operations of @lumieducation/h5p-server
    // if you want to user the editor component.
    //
    // To create the H5PEditor object, we call a helper function, which
    // uses implementations of the storage classes with a local filesystem
    // or a MongoDB/S3 backend, depending on the configuration values set
    // in the environment variables.
    // In your implementation, you will probably instantiate H5PEditor by
    // calling new H5P.H5PEditor(...) or by using the convenience function
    // H5P.fs(...).
    const h5pEditor: H5P.H5PEditor = await createH5PEditor(
        config,
        serverConfig.librariesPath, // the path on the local disc where libraries should be stored)
        serverConfig.workingCachePath, // the path on the local disc where content is stored. Only used / necessary if you use the local filesystem content storage class.
        serverConfig.temporaryStoragePath, // the path on the local disc where temporary files (uploads) should be stored. Only used / necessary if you use the local filesystem temporary storage class.
        (key, language) => {
            return translationFunction(key, { lng: language });
        }
    );

    h5pEditor.setRenderer(model => model);

    const h5pPlayer = new H5P.H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config
    );

    h5pPlayer.setRenderer(model => model);

    // const h5pEditor = new H5P.H5PEditor(
    //     new JsonStorage(serverConfig.cache),
    //     new H5P.H5PConfig(
    //         new H5P.fsImplementations.InMemoryStorage(),
    //         new H5P.H5PConfig(
    //             new H5P.fsImplementations.InMemoryStorage(),
    //             h5pConfig
    //         )
    //     ),
    //     new H5P.fsImplementations.FileLibraryStorage(
    //         serverConfig.librariesPath
    //     ),
    //     new H5P.fsImplementations.FileContentStorage(
    //         serverConfig.workingCachePath
    //     ),
    //     new DirectoryTemporaryFileStorage(serverConfig.temporaryStoragePath)
    // );

    const app = express();
    app.use(Sentry.Handlers.requestHandler());

    app.use(bodyParser.json({ limit: h5pEditor.config.maxTotalSize }));
    app.use(
        bodyParser.urlencoded({
            extended: true,
            limit: h5pEditor.config.maxTotalSize
        })
    );

    app.use(
        fileUpload({
            limits: { fileSize: h5pEditor.config.maxTotalSize }
        })
    );

    app.use(
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            (req as any).user = new User();
            next();
        }
    );

    // The i18nextExpressMiddleware injects the function t(...) into the req
    // object. This function must be there for the Express adapter
    // (H5P.adapters.express) to function properly.
    app.use(i18nextHttpMiddleware.handle(i18next));

    app.use('/', routes(h5pEditor, h5pPlayer, serverConfig));

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
