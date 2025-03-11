import { Menu } from 'electron';

import file_menu from './file';
import lumi_menu from './lumi';
import view_menu from './view';
import help_menu from './help';
import { Context } from '../boot';
import window_menu from './window';

export function show_content_menu(ctx: Context): void {
  ctx.menu = 'content';
  const template = [
    ...lumi_menu(ctx),
    ...file_menu(ctx),
    ...view_menu(ctx),
    ...window_menu(ctx),
    ...help_menu(ctx)
  ];

  const _menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(_menu);
}

export function show_settings_menu(ctx: Context): void {
  ctx.menu = 'settings';
  const template = [
    ...lumi_menu(ctx),
    ...file_menu(ctx),
    ...view_menu(ctx),
    ...window_menu(ctx),
    ...help_menu(ctx)
  ];

  const _menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(_menu);
}
