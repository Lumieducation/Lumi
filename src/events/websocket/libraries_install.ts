import { app } from 'electron';
import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import libraries_copy from '../../ops/libraries_copy';
import dialog_message_show from '../../ops/dialog_message_show';

export default function libraries_install(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('libraries_install', async () => {
    context.log.info('events:websocket:libraries_install');

    dialog_message_show(
      context.translate(
        'Installing libraries. The application will restart when the installation is complete.'
      ),
      'info'
    );

    await libraries_copy(context);

    app.relaunch();
  });
}
