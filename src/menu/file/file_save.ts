import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';
import menu_file_save_as from './file_save_as';
import window_get_active from '../../ops/window_get_active';
import content_config_read from '../../ops/content_config_read';
import window_backdrop_hide from '../../ops/window_backdrop_hide';
import window_backdrop_show from '../../ops/window_backdrop_show';
import window_get_content_id from '../../ops/window_get_content_id';

export default function file_save(ctx: Context): MenuItem {
  return {
    label: ctx.translate('Save'),
    accelerator: 'CmdOrCtrl+S',
    click: async () => {
      const active_window = window_get_active();
      const content_id = await window_get_content_id(active_window);
      const path = await content_config_read(ctx, content_id, 'path');
      await window_backdrop_show(ctx, content_id);

      if (content_id === 'new' || !path) {
        menu_file_save_as(ctx).click();
        window_backdrop_hide(ctx, content_id);
        return;
      }
      ctx.ws.emit(content_id, { type: 'save' });
    }
  };
}
