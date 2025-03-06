import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import content_config_write from '../../ops/content_config_write';
import content_save_to_file from '../../ops/content_save_to_file';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_snackbar_show from '../../ops/window_snackbar_show';

export default function setup_save(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('save_as', async (payload) => {
    context.log.info('events:websocket:save_as', payload);
    const { contentId, file_path } = payload;

    await content_config_write(context, contentId, 'path', file_path);
    await content_save_to_file(context, contentId, file_path);
    await window_backdrop_hide(context, contentId);
    await window_snackbar_show(
      context,
      contentId,
      context.translate(`Content saved to {{file_path}}`, { file_path }),
      'success'
    );
  });
}
