import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import settings_write from '../../ops/settings_write';
import language_change from '../../ops/language_change';

export default function setup_save(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('language_change', async (payload) => {
    const { language_code } = payload;

    await settings_write(context, { language: language_code });
    await language_change(context, language_code);
  });
}
