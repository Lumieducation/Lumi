import path from 'path';
import bunyan from 'bunyan';
import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
// import i18next, { TFunction } from 'i18next';
import { h5pAjaxExpressRouter } from '@lumieducation/h5p-express';

import User from '../models/User';
import { Context } from '../boot';
import editContent from './controller/edit-content';
import saveContent from './controller/save-content';
import getSettings from './controller/get-settings';
// import i18nextHttpMiddleware from 'i18next-http-middleware';
import renderContent from './controller/render-content';

/**
 * Creates the main Express app.
 */
export default async (
  ctx: Context,
  log: bunyan.Logger
): Promise<express.Express> => {
  const app = express();

  app.use((req: any, res: any, next) => {
    req.ctx = ctx;
    req.log = log;

    req.user = new User();

    next();
  });

  app.use(bodyParser.json({ limit: ctx.h5pEditor.config.maxTotalSize }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: ctx.h5pEditor.config.maxTotalSize
    })
  );

  app.use(
    fileUpload({
      limits: { fileSize: ctx.h5pEditor.config.maxTotalSize }
    })
  );

  app.use(renderContent);
  app.use(editContent);
  app.use(saveContent);
  app.use(getSettings);

  app.use(
    ctx.h5pEditor.config.baseUrl,
    h5pAjaxExpressRouter(
      ctx.h5pEditor,
      `${__dirname}/../../../h5p/core`, // the path on the local disc where the files of the JavaScript client of the player are stored
      `${__dirname}/../../../h5p/editor`, // the path on the local disc where the files of the JavaScript client of the editor are stored
      undefined,
      'auto' // You can change the language of the editor here by setting
      // the language code you need here. 'auto' means the route will try
      // to use the language detected by the i18next language detector.
    )
  );

  app.get('*', express.static(path.resolve(ctx.paths.app, 'client')));
  app.get('*', express.static(path.resolve(ctx.paths.app, 'assets')));

  // Add this middleware to redirect all requests to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(ctx.paths.app, 'client', 'index.html'));
  });

  return app;
};
