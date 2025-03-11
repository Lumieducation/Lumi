import * as electron from 'electron';

import { Context } from '../../boot';
import window_open from '../../ops/window_open';

export default function open_file(ctx: Context) {
  electron.app.on('open-file', async (event: electron.Event, path: string) => {
    ctx.log.info('events:app:open-file', path);
    event.preventDefault();
    window_open(ctx, undefined, path);
  });
}
