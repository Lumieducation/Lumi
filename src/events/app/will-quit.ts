import * as electron from 'electron';

import { Context } from '../../boot';
import content_tmp_cleanup from '../../ops/content_tmp_cleanup';

export default function will_quit(context: Context) {
  electron.app.on('will-quit', async (event) => {
    context.log.info(`events:app:will-quit`);
    // use the event to prevent the app from quitting and quit the app after the cleanup
    event.preventDefault();
    await content_tmp_cleanup(context);

    electron.app.exit();
  });
}
