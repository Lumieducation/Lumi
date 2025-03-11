/* eslint-disable import/no-cycle */
import http from 'http';
import path from 'path';
import bunyan from 'bunyan';
import { app } from 'electron';
import { TFunction } from 'i18next';
import * as SocketIO from 'socket.io';
import * as H5P from '@lumieducation/h5p-server';

import boot_i18n from './i18n';
import boot_logger from './log';
import boot_websocket from './websocket';
// eslint-disable-next-line import/no-named-as-default
import boot_h5p_editor from './h5p-editor';
import boot_h5p_player from './h5p-player';
import boot_express_app from '../express/app';
import language_get from '../ops/language_get';
import H5PConfig from '../../config/h5p-config';
import content_click from '../ops/content_click';

export interface Context {
  menu: string;
  h5pEditor: H5P.H5PEditor;
  h5pPlayer: H5P.H5PPlayer;
  log: bunyan.Logger;
  is_development: boolean;
  ws: SocketIO.Server;
  port: number;
  is_test: boolean;
  translate: TFunction;
  language_code: string;
  open_files: string[];
  show_no_update_message: boolean;
  paths: {
    settings: string;
    content: string;
    app: string;
    tmp: string;
  };
  update: {
    downloaded: boolean;
    quit_and_install: boolean;
  };
}

export default async function boot(): Promise<Context> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const log = boot_logger();

    // we need to keep track of the files that are opened before the app is ready
    const open_files: string[] = [];
    content_click(log, open_files);

    log.info('boot started');
    const is_development = process.env.NODE_ENV === 'development';
    const is_test = process.env.NODE_ENV === 'test';

    const config = await new H5PConfig().load();

    const paths = {
      settings: path.join(app.getPath('userData'), 'settings.json'),
      content: path.join(app.getPath('userData'), 'content'),
      library: path.join(app.getPath('userData'), 'libraries'),
      app: `${__dirname}/../../../`,
      tmp: path.join(app.getPath('userData'), 'tmp')
    };

    const context = {
      menu: 'content',
      h5pEditor: null,
      h5pPlayer: null,
      log,
      is_development,
      show_no_update_message: false,
      open_files,
      port: 0,
      ws: null,
      language_code: null,
      translate: null,
      is_test,
      paths,
      update: {
        downloaded: false,
        quit_and_install: false
      }
    };

    const language_code = await language_get(context);
    context.language_code = language_code;
    const translate = await boot_i18n(language_code, is_development);

    const h5pEditor = await boot_h5p_editor(
      config,
      paths.library,
      paths.content,
      paths.tmp,
      translate
    );

    const h5pPlayer = await boot_h5p_player(config, h5pEditor);

    context.h5pEditor = h5pEditor;
    context.h5pPlayer = h5pPlayer;

    const expressApp = await boot_express_app(context, context.log);
    const server = http.createServer(expressApp);

    const ws = boot_websocket(context, server);

    context.ws = ws;
    context.translate = translate;

    server.listen(is_development ? 3000 : 0, () => {
      context.port = (server.address() as any).port;
      context.log.info(`Server started at http://localhost:${context.port}`);
      resolve(context);
    });

    log.info('boot sequence completed');
  });
}
