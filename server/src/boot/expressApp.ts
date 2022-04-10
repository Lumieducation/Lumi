import * as H5P from '@lumieducation/h5p-server';
import electron from 'electron';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';
import i18next, { TFunction } from 'i18next';
import i18nextHttpMiddleware from 'i18next-http-middleware';

import IServerConfig from '../config/IPaths';
import LumiError from '../helpers/LumiError';
import routes from '../routes';
import SettingsCache from '../config/SettingsCache';
import User from '../h5pImplementations/User';
import StateStorage from '../state/electronState';
import FileHandleManager from '../state/FileHandleManager';
import { IFilePickers } from '../types';

/**
 * Creates the main Express app.
 */
export default async (
    h5pEditor: H5P.H5PEditor,
    h5pPlayer: H5P.H5PPlayer,
    serverConfig: IServerConfig,
    getBrowserWindow: () => electron.BrowserWindow,
    settingsCache: SettingsCache,
    translationFunction: TFunction,
    electronState: StateStorage,
    filePickers: IFilePickers,
    fileHandleManager: FileHandleManager
) => {
    const app = express();

    if (process.env.NODE_ENV !== 'development') {
        Sentry.init({
            dsn: 'https://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
            release: electron.app?.getVersion(),
            environment: process.env.NODE_ENV,
            beforeSend: async (event: Sentry.Event) => {
                if ((await settingsCache.getSettings()).bugTracking) {
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
        const languageCode = (await settingsCache.getSettings()).language;
        req.language = languageCode;
        req.languages = [languageCode, 'en'];
        next();
    });
    app.use(
        '/',
        routes(
            h5pEditor,
            h5pPlayer,
            serverConfig,
            getBrowserWindow,
            settingsCache,
            (key, language) => translationFunction(key, { lng: language }),
            electronState,
            filePickers,
            fileHandleManager
        )
    );

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());

    return app;
};
