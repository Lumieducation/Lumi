import * as SocketIO from 'socket.io';

import save from './save';
import setup from './setup';
import save_as from './save_as';
import relaunch from './relaunch';
import { Context } from '../../boot';
import update_check from './update_check';
import export_as_html from './export_as_html';
import update_install from './update_install';
import export_as_scorm from './export_as_scorm';
import settings_update from './settings_update';
import language_change from './language_change';
import libraries_install from './libraries_install';
import export_as_html_external from './export_as_html_external';

export default function setup_websocket_events(
  context: Context,
  socket: SocketIO.Socket
): void {
  context.log.info('events:websocket:setup_websocket_events');
  save(context, socket);
  save_as(context, socket);
  export_as_scorm(context, socket);
  export_as_html(context, socket);
  export_as_html_external(context, socket);
  settings_update(context, socket);
  update_check(context, socket);
  update_install(context, socket);
  language_change(context, socket);
  libraries_install(context, socket);
  setup(context, socket);
  relaunch(context, socket);
}
