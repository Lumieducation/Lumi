import * as SocketIO from 'socket.io';

import { Context } from '../../boot';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_snackbar_show from '../../ops/window_snackbar_show';
import window_backdrop_show from '../../ops/window_backdrop_show';
import dialog_export_save_as_show from '../../ops/dialog_export_save_as_show';
import content_export_as_html_external from '../../ops/content_export_as_html_external';

export default function event_websocket_export_as_html_external(
  context: Context,
  socket: SocketIO.Socket
): void {
  socket.on('export_as_html_external', async (payload) => {
    const { contentId } = payload;

    const { file_path } = await dialog_export_save_as_show(
      context.translate('Export as HTML with external media files'),
      '.html',
      ['.html']
    );

    if (!file_path) {
      return;
    }

    await window_backdrop_show(context, contentId);

    await content_export_as_html_external(context, contentId, file_path);

    await window_backdrop_hide(context, contentId);
    await window_snackbar_show(
      context,
      contentId,
      context.translate(`Content exported to {{file_path}}`, { file_path }),
      'success'
    );
  });
}
