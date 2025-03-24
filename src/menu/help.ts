import path from 'path';
import { app, shell } from 'electron';

import { Context } from '../boot';

export default function view(ctx: Context): any {
  return [
    {
      label: ctx.translate('Help'),
      submenu: [
        {
          label: ctx.translate('Toggle Developer Tools'),
          role: 'toggleDevTools'
        },
        {
          label: ctx.translate('Open logs'),
          click: async () => {
            shell.openPath(path.join(app.getPath('logs'), 'main.log'));
          }
        }
      ]
    }
  ];
}
