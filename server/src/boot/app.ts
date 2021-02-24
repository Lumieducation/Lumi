import * as H5P from '@lumieducation/h5p-server';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';

import fsExtra from 'fs-extra';

import i18next from 'i18next';
import i18nextHttpMiddleware from 'i18next-http-middleware';
import i18nextFsBackend from 'i18next-fs-backend';

import routes from '../routes';

import IServerConfig from '../IServerConfig';

import createH5PEditor from './createH5PEditor';

import User from '../User';

export default async (
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow
) => {
    const translationFunction = await i18next
        .use(i18nextFsBackend)
        .use(i18nextHttpMiddleware.LanguageDetector) // This will add the
        // properties language and languages to the req object.
        // See https://github.com/i18next/i18next-http-middleware#adding-own-detection-functionality
        // how to detect language in your own fashion. You can also choose not
        // to add a detector if you only want to use one language.
        .init({
            backend: {
                loadPath: path.resolve(
                    process.env.NODE_ENV === 'development'
                        ? ''
                        : 'resources/app',
                    'node_modules/@lumieducation/h5p-server/build/assets/translations/{{ns}}/{{lng}}.json'
                )
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

    h5pEditor.setRenderer((model) => model);

    const h5pPlayer = new H5P.H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config
    );

    h5pPlayer.setRenderer((model) => model);

    const app = express();

    if (
        process.env.NODE_ENV !== 'development' &&
        process.env.NODE_ENV !== 'CI'
    ) {
        if (await fsExtra.pathExists(serverConfig.settingsFile)) {
            const settings = await fsExtra.readJSON(serverConfig.settingsFile);

            if (settings.bugTracking) {
                Sentry.init({
                    dsn:
                        'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
                    release: electron.app.getVersion(),
                    environment: process.env.NODE_ENV,
                    integrations: [
                        // enable HTTP calls tracing
                        new Sentry.Integrations.Http({ tracing: true }),
                        // enable Express.js middleware tracing
                        new Tracing.Integrations.Express({ app })
                    ],

                    // We recommend adjusting this value in production, or using tracesSampler
                    // for finer control
                    tracesSampleRate: 1.0
                });
                Sentry.setTag('type', 'server');
            }
        }
    }

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

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

    app.use('/', routes(h5pEditor, h5pPlayer, serverConfig, browserWindow));

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());

    app.use((error, req, res, next) => {
        // Sentry.captureException(error);
        res.status(error.status || 500).json({
            code: error.code,
            message: error.message,
            status: error.status
        });
    });
    return app;
};
