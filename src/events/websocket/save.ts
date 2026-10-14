import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import activeContentSaves from './content_save_locks';
import content_config_read from '../../ops/content_config_read';
import content_save_to_file from '../../ops/content_save_to_file';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_backdrop_show from '../../ops/window_backdrop_show';
import window_snackbar_show from '../../ops/window_snackbar_show';

export default function setup_save(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('save', async (payload) => {
    context.log.info('events:websocket:save', payload);

    const { contentId } = payload;
    if (activeContentSaves.has(contentId)) {
      context.log.warn('events:websocket:save already in progress', {
        contentId
      });
      await window_snackbar_show(
        context,
        contentId,
        context.translate('Save already in progress'),
        'info'
      );
      return;
    }

    activeContentSaves.add(contentId);
    // The backdrop is only shown once the save actually reaches the server.
    // If the client aborts the save (e.g. because the content title is
    // missing), no backdrop was displayed and none has to be hidden.
    await window_backdrop_show(context, contentId);
    try {
      const path = await content_config_read(context, contentId, 'path');
      await content_save_to_file(context, contentId, path);
      await window_snackbar_show(
        context,
        contentId,
        context.translate(`Content saved to {{file_path}}`, {
          file_path: path
        }),
        'success'
      );
    } catch (error) {
      context.log.error('events:websocket:save failed', {
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
