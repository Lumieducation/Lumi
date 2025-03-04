import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import content_config_read from '../../ops/content_config_read';
import content_save_to_file from '../../ops/content_save_to_file';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_snackbar_show from '../../ops/window_snackbar_show';

export default function setup_save(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('save', async (payload) => {
    const { contentId } = payload;
    const path = await content_config_read(context, contentId, 'path');

    await content_save_to_file(context, contentId, path);
    await window_backdrop_hide(context, contentId);
    await window_snackbar_show(
      context,
      contentId,
      context.translate(`Content saved to {{file_path}}`, { file_path: path }),
      'success'
    );
  });
}
