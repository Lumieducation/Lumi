import { Context } from '../../boot';
import MenuItem from '../../types/MenuItem';

export default function file_close(ctx: Context): MenuItem {
  return {
    label: ctx.translate('Close'),
    accelerator: 'CmdOrCtrl+W'
  };
}
