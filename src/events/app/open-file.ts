import * as electron from 'electron';

import { Context } from '../../boot';
import window_open from '../../ops/window_open';
import content_import from '../../ops/content_import';
import content_config_write from '../../ops/content_config_write';

export default function open_file(ctx: Context) {
  electron.app.on('open-file', async (event: electron.Event, path: string) => {
    event.preventDefault();
    ctx.log.info('event:open-file', path);
    const content = await content_import(ctx, [path]);

    if (content.length > 0) {
      await content_config_write(ctx, content[0].id, 'path', content[0].path);
      await window_open(ctx, content[0].id);
    }
  });
}
