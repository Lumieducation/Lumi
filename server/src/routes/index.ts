import express from 'express';
import electron from 'electron';

import { H5PEditor, H5PPlayer } from '@lumieducation/h5p-server';
import {
    h5pAjaxExpressRouter,
    libraryAdministrationExpressRouter,
    contentTypeCacheExpressRouter
} from '@lumieducation/h5p-express';

import lumiRoutes from './lumiRoutes';
import trackingRoutes from './trackingRoutes';
import Logger from '../helpers/Logger';
import IServerConfig from '../IServerConfig';
import authRoutes from './authRoutes';
import h5pRoutes from './h5pRoutes';
import analyticRoutes from './analyticRoutes';
import settingsRoutes from './settingsRoutes';
import runRoutes from './runRoutes';
import systemRoutes from './systemRoutes';
import updatesRoutes from './updatesRoutes';

import User from '../User';

const log = new Logger('routes');

export default function (
    h5pEditor: H5PEditor,
    h5pPlayer: H5PPlayer,
    serverConfig: IServerConfig,
    browserWindow: electron.BrowserWindow,
    app: express.Application
): express.Router {
    const router = express.Router();

    log.info('setting up routes');

    router.use('/api/v1/auth', authRoutes());
    router.use('/api/v1/track', trackingRoutes(serverConfig));
    router.use('/api/v1/analytics', analyticRoutes(browserWindow));

    // Adding dummy user to make sure all requests can be handled
    router.use((req, res, next) => {
        (req as any).user = new User();
        next();
    });

    router.use('/api/v1/system', systemRoutes());
    router.use('/api/v1/updates', updatesRoutes());

    router.use(
        '/api/v1/settings',
        settingsRoutes(serverConfig, browserWindow, app)
    );

    router.use('/api/run', runRoutes(serverConfig, h5pEditor, browserWindow));

    // // Directly serving the library and content files statically speeds up
    // // loading times and there is no security issue, as Lumi never is a
    // // multi-user environment.
    // router.use(
    //     h5pConfig.baseUrl + h5pConfig.contentFilesUrl,
    //     express.static(`${serverConfig.contentStoragePath}`)
    // );
    // router.use(
    //     h5pConfig.baseUrl + h5pConfig.librariesUrl,
    //     express.static(`${serverConfig.librariesPath}`)
    // );

    // The Express adapter handles GET and POST requests to various H5P
    // endpoints. You can add an options object as a last parameter to configure
    // which endpoints you want to use. In this case we don't pass an options
    // object, which means we get all of them.
    router.use(
        h5pEditor.config.baseUrl,
        h5pAjaxExpressRouter(
            h5pEditor,
            `${__dirname}/../../../h5p/core`, // the path on the local disc where the files of the JavaScript client of the player are stored
            `${__dirname}/../../../h5p/editor`, // the path on the local disc where the files of the JavaScript client of the editor are stored
            undefined,
            'auto' // You can change the language of the editor here by setting
            // the language code you need here. 'auto' means the route will try
            // to use the language detected by the i18next language detector.
        )
    );

    router.use('/locales', express.static(`${__dirname}/../../../locales`));

    // async (req, res) => {
    //     try {
    //         const languageCode = (
    //             await fsExtra.readJSON(serverConfig.settingsFile)
    //         ).language;
    //         const locale = await fsExtra.readJSON(
    //             `${__dirname}/../../../locales/${languageCode}.json`
    //         );
    //         res.status(200).json(locale);
    //     } catch (error) {
    //         Sentry.captureException(error);
    //         const locale = await fsExtra.readJSON(
    //             `${__dirname}/../../../locales/en.json`
    //         );
    //         res.status(200).json(locale);
    //     }
    // });

    // The expressRoutes are routes that create pages for these actions:
    // - Creating new content
    // - Editing content
    // - Saving content
    // - Deleting content
    router.use(
        h5pEditor.config.baseUrl,
        h5pRoutes(
            h5pEditor,
            h5pPlayer,
            'auto', // You can change the language of the editor here by sett
            // the language code you need here. 'auto' means the route will try
            // to use the language detected by the i18next language detector.,
            browserWindow
        )
    );

    // The LibraryAdministrationExpress routes are REST endpoints that offer library
    // management functionality.
    router.use(
        `${h5pEditor.config.baseUrl}/libraries`,
        libraryAdministrationExpressRouter(h5pEditor)
    );

    // The ContentTypeCacheExpress routes are REST endpoints that allow updating
    // the content type cache manually.
    router.use(
        `${h5pEditor.config.baseUrl}/content-type-cache`,
        contentTypeCacheExpressRouter(h5pEditor.contentTypeCache)
    );

    router.use(
        '/api/v1/lumi',
        lumiRoutes(h5pEditor, serverConfig, browserWindow)
    );

    router.get('*', express.static(`${__dirname}/../../client`));

    return router;
}
