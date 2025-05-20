import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import settings_write from '../../ops/settings_write';
import language_change from '../../ops/language_change';
import window_all_reload from '../../ops/window_all_reload';

export default function setup_save(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('language_change', async (payload) => {
    context.log.info('events:websocket:language_change', payload);
    const { language_code } = payload;

    context.language_code = language_code;
    await settings_write(context, { language: language_code });
    await language_change(context, language_code);

    await window_all_reload(context);
  });
}
