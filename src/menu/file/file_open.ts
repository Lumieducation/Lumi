import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';
import window_open from '../../ops/window_open';
import dialog_open_files_show from '../../ops/dialog_open_files_show';

export default function file_open(ctx: Context): MenuItem {
  return {
    label: ctx.translate('Open'),
    accelerator: 'CmdOrCtrl+O',
    click: async () => {
      const files = await dialog_open_files_show();

      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        await window_open(ctx, undefined, file);
      }
    }
  };
}
