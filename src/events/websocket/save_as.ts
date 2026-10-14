import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import activeContentSaves from './content_save_locks';
import content_config_write from '../../ops/content_config_write';
import content_save_to_file from '../../ops/content_save_to_file';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_backdrop_show from '../../ops/window_backdrop_show';
import window_snackbar_show from '../../ops/window_snackbar_show';

export default function setup_save(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('save_as', async (payload) => {
    context.log.info('events:websocket:save_as', payload);
    const { contentId, file_path } = payload;

    if (activeContentSaves.has(contentId)) {
      context.log.warn('events:websocket:save_as already in progress', {
        contentId
      });
      return;
    }

    activeContentSaves.add(contentId);
    // The backdrop is only shown once the save actually reaches the server.
    // If the client aborts the save (e.g. because the content title is
    // missing), no backdrop was displayed and none has to be hidden.
    await window_backdrop_show(context, contentId);
    try {
      await content_save_to_file(context, contentId, file_path);
      await content_config_write(context, contentId, 'path', file_path);
      await window_snackbar_show(
        context,
        contentId,
        context.translate(`Content saved to {{file_path}}`, { file_path }),
        'success'
      );
    } catch (error) {
      context.log.error('events:websocket:save_as failed', {
        contentId,
        error: error instanceof Error ? error.message : String(error)
      });
      await window_snackbar_show(
        context,
        contentId,
        context.translate('Error while saving content'),
        'error'
      );
    } finally {
      await window_backdrop_hide(context, contentId);
      activeContentSaves.delete(contentId);
    }
  });
}
