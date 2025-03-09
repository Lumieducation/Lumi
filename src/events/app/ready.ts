import * as electron from 'electron';

import { Context } from '../../boot';
import window_open from '../../ops/window_open';
import settings_read from '../../ops/settings_read';
import content_open_from_argv from '../../ops/content_open_from_argv';
import update_check_and_notify from '../../ops/update_check_and_notify';
import content_open_from_click from '../../ops/content_open_from_click';
import content_open_all_from_working_directory from '../../ops/content_open_all_from_working_directory';

export default function ready(context: Context) {
  electron.app.whenReady().then(async () => {
    context.log.info(`events:app:ready`);
    const content_ids_from_working_directory =
      await content_open_all_from_working_directory(context);

    // on windows files are opened from the command line
    const content_ids_from_argv = await content_open_from_argv(context);

    const content_ids_from_click = await content_open_from_click(context);

    const content_ids = [
      ...content_ids_from_working_directory,
      ...content_ids_from_argv,
      ...content_ids_from_click
    ];

    if (content_ids.length === 0) {
      await window_open(context, 'new');
    }

    const settings = await settings_read(context);

    if (settings.updates_automatic) {
      update_check_and_notify(context);
    }
  });
}
