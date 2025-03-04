import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';
import window_open from '../../ops/window_open';
import content_import from '../../ops/content_import';
import content_config_write from '../../ops/content_config_write';
import dialog_open_files_show from '../../ops/dialog_open_files_show';

export default function file_open(ctx: Context): MenuItem {
  return {
    label: ctx.translate('Open'),
    accelerator: 'CmdOrCtrl+O',
    click: async () => {
      const files = await dialog_open_files_show();
      const contents = await content_import(ctx, files);

      // eslint-disable-next-line no-restricted-syntax
      for (const content of contents) {
        await content_config_write(ctx, content.id, 'path', content.path);
        await window_open(ctx, content.id);
      }
    }
  };
}
