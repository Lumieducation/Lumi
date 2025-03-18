import { app } from 'electron';
import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import settings_write from '../../ops/settings_write';
import libraries_copy from '../../ops/libraries_copy';
import dialog_message_show from '../../ops/dialog_message_show';

export default function setup(context: Context, socket: SocketIO.Socket): void {
  socket.on('setup', async (payload) => {
    context.log.info('events:websocket:setup', payload);

    settings_write(context, {
      show_setup: false,
      prerelease_features: payload.prerelease_features,
      updates_automatic: payload.updates_automatic
    });

    if (payload.libraries_install) {
      dialog_message_show(
        context.translate(
          'Installing libraries. The application will restart when the installation is complete.'
        ),
        'info'
      );

      await libraries_copy(context);
    }
    app.relaunch();
    app.quit();
  });
}
