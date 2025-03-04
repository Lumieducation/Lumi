import { Context } from '../boot';

export default function view(ctx: Context): any {
  return [
    {
      label: ctx.translate('Help'),
      submenu: [
        {
          label: ctx.translate('Toggle Developer Tools'),
          role: 'toggleDevTools'
        }
      ]
    }
  ];
}
