import { Menu } from 'electron';

import file_menu from './file';
import lumi_menu from './lumi';
import view_menu from './view';
import help_menu from './help';
import { Context } from '../boot';
import mac_menu from './mac-menu';
import window_menu from './window';

export default function menu(ctx: Context): void {
  const template = [
    ...mac_menu(ctx),
    ...lumi_menu(ctx),
    ...file_menu(ctx),
    ...view_menu(ctx),
    ...window_menu(ctx),
    ...help_menu(ctx)
  ];

  const _menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(_menu);
}
