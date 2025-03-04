import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';
import show_dialog_save_as from '../../ops/dialog_save_as';
import window_get_active from '../../ops/window_get_active';
import window_backdrop_show from '../../ops/window_backdrop_show';
import window_get_content_id from '../../ops/window_get_content_id';

export default function file_save_as(ctx: Context): MenuItem {
  return {
    label: ctx.translate('Save As'),
    accelerator: 'CmdOrCtrl+Shift+S',
    click: async () => {
      const { file_path, canceled } = await show_dialog_save_as();

      if (canceled) {
        return;
      }
      const active_window = await window_get_active();
      const content_id = await window_get_content_id(active_window);
      await window_backdrop_show(ctx, content_id);
      ctx.ws.emit(content_id, { type: 'save_as', payload: { file_path } });
    }
  };
}
