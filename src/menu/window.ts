import { Context } from '../boot';
import window_open from '../ops/window_open';

export default function window_menu(ctx: Context): any {
  const isMac = process.platform === 'darwin';

  return isMac
    ? [
        {
          label: ctx.translate('Window'),
          submenu: [
            {
              label: ctx.translate('Minimize'),
              role: 'minimize'
            },
            {
              label: ctx.translate('Zoom'),
              role: 'zoom'
            },
            ...(isMac
              ? [
                  { type: 'separator' },
                  {
                    label: ctx.translate('Bring All to Front'),
                    role: 'front'
                  },
                  { type: 'separator' },
                  {
                    label: ctx.translate('Show'),
                    accelerator: 'CmdOrCtrl+)',
                    click: () => {
                      window_open(ctx, 'new');
                    }
                  }
                ]
              : [
                  {
                    label: ctx.translate('Close'),
                    role: 'close'
                  }
                ])
          ]
        }
      ]
    : [];
}
