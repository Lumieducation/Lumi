import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';
import window_close from '../../ops/window_close';
import window_get_active from '../../ops/window_get_active';
import window_get_content_id from '../../ops/window_get_content_id';

export default function file_close(ctx: Context): MenuItem {
  return {
    label: ctx.translate('Close'),
    accelerator: 'CmdOrCtrl+W',
    click: async () => {
      const active_window = await window_get_active();
      const content_id = await window_get_content_id(active_window);

      active_window.close();
      await window_close(ctx, content_id);
    }
  };
}
