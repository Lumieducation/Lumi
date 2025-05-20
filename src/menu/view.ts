import { Context } from '../boot';

export default function view(ctx: Context): any {
  const isMac = process.platform === 'darwin';

  return isMac
    ? [
        {
          label: ctx.translate('View'),
          submenu: [
            {
              label: ctx.translate('Actual size'),
              role: 'resetZoom'
            },
            {
              label: ctx.translate('Zoom in'),
              role: 'zoomIn'
            },
            {
              label: ctx.translate('Zoom out'),
              role: 'zoomOut'
            },
            { type: 'separator' },
            {
              label: ctx.translate('Toggle fullscreen'),
              role: 'togglefullscreen'
            }
          ]
        }
      ]
    : [];
}
