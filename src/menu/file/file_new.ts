import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';
import window_open from '../../ops/window_open';

export default function file_new(ctx: Context): MenuItem {
  return {
    label: ctx.translate('New'),
    accelerator: 'CmdOrCtrl+N',
    click: async () => {
      await window_open(ctx, 'new');
    }
  };
}
