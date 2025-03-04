import file_new from './file_new';
import file_open from './file_open';
import file_save from './file_save';
import { Context } from '../../boot';
import file_close from './file_close';
import file_export from './file_export';
import file_save_as from './file_save_as';

export default function file_menu(ctx: Context): any[] {
  const menu = [
    {
      label: ctx.translate('File'),
      submenu: [
        file_new(ctx),
        { type: 'separator' } as any,
        file_open(ctx),
        { type: 'separator' } as any,
        file_save(ctx),
        file_save_as(ctx),
        { type: 'separator' } as any,
        file_export(ctx),
        { type: 'separator' } as any,
        file_close(ctx)
      ]
    }
  ];

  return menu;
}
