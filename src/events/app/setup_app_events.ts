import ready from './ready';
import activate from './activate';
import open_file from './open-file';
import { Context } from '../../boot';
import window_all_closed from './window-all-closed';

export default async function event_setup(ctx: Context) {
  ctx.log.info(`events:app:setup`);
  open_file(ctx);
  activate(ctx);
  ready(ctx);
  window_all_closed(ctx);
}
