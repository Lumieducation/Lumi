import ready from './ready';
import activate from './activate';
import open_file from './open-file';
import { Context } from '../../boot';
import window_all_closed from './window-all-closed';

export default async function event_setup(ctx: Context) {
  activate(ctx);
  open_file(ctx);
  ready(ctx);
  window_all_closed(ctx);
}
