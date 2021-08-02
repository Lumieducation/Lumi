import * as H5P from '@lumieducation/h5p-server';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';

import i18next from 'i18next';
import i18nextHttpMiddleware from 'i18next-http-middleware';

import LumiError from '../helpers/LumiError';

import routes from '../routes';

import IServerConfig from '../IServerConfig';

import createH5PEditor from './createH5PEditor';

import User from '../User';

import settingsCache from '../settingsCache';

import boot_i18n from './i18n';

/**
 * Increases the maximum file size if it is still at the default value.
 */
const increaseMaxFileSize = async (config: H5P.IH5PConfig) => {
    let updatedConfig = false;
    if (!config.maxFileSize || config.maxFileSize === 16 * 1024 * 1024) {
        config.maxFileSize = 2048 * 1024 * 1024;
        updatedConfig = true;
    }
    if (!config.maxTotalSize || config.maxTotalSize === 64 * 1024 * 1024) {
        config.maxTotalSize = 2048 * 1024 * 1024;
        updatedConfig = true;
    }
    if (updatedConfig) {
        await config.save();
    }
};

export default async (
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow,
    options?: {
        devMode?: boolean;
        libraryDir?: string;
    }
) => {
    const config = await new H5P.H5PConfig(
        new H5P.fsImplementations.JsonStorage(serverConfig.configFile)
    ).load();

    await increaseMaxFileSize(config);

    const translationFunction = await boot_i18n(serverConfig);

    // The H5PEditor object is central to all operations of
    // @lumieducation/h5p-server if you want to user the editor component.
    const h5pEditor: H5P.H5PEditor = await createH5PEditor(
        config,
        options?.libraryDir ?? serverConfig.librariesPath, // the path on the local disc where libraries should be stored)
        serverConfig.contentStoragePath, // the path on the local disc where content is stored. Only used / necessary if you use the local filesystem content storage class.
        serverConfig.temporaryStoragePath, // the path on the local disc where temporary files (uploads) should be stored. Only used / necessary if you use the local filesystem temporary storage class.
        (key, language) => translationFunction(key, { lng: language }),
        {
            disableLibraryCache: options?.devMode
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

    if (process.env.NODE_ENV !== 'development') {
        Sentry.init({
            dsn: 'https://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
            release: electron.app.getVersion(),
            environment: process.env.NODE_ENV,
            beforeSend: async (event: Sentry.Event) => {
                if (settingsCache.getSettings().bugTracking) {
                    return event;
                }
                return null;
            }
        });
        Sentry.setTag('type', 'server');
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

    app.use(async (req: any, res: any, next: express.NextFunction) => {
        const languageCode = settingsCache.getSettings().language;
        req.language = languageCode;
        req.languages = [languageCode, 'en'];
        next();
    });
    app.use(
        '/',
        routes(h5pEditor, h5pPlayer, serverConfig, browserWindow, app)
    );

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());

    app.use((error, req, res, next) => {
        Sentry.captureException(error);
        res.status(error.status || 500).json(
            new LumiError(error.code, error.message, error.status)
        );
    });
    return app;
};
