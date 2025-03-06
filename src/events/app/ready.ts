import * as electron from 'electron';

import { Context } from '../../boot';
import window_open from '../../ops/window_open';
import settings_read from '../../ops/settings_read';
import update_check_and_notify from '../../ops/update_check_and_notify';
import content_open_all_from_working_directory from '../../ops/content_open_all_from_working_directory';

export default function ready(context: Context) {
  electron.app.whenReady().then(async () => {
    context.log.info(`events:app:ready`);
    const content_ids = await content_open_all_from_working_directory(context);

    if (content_ids.length === 0) {
      await window_open(context, 'new');
    }

    const settings = await settings_read(context);

    if (settings.updates_automatic) {
      update_check_and_notify(context);
    }
  });
}
