import { Context } from '../boot';

export default function mac_menu(ctx: Context) {
  const isMac = process.platform === 'darwin';

  return isMac
    ? [
        {
          label: 'Lumi',
          submenu: [
            {
              label: `About Lumi`,
              role: 'about'
            },
            { type: 'separator' },
            {
              label: `Services`,
              role: 'services'
            },
            { type: 'separator' },
            { label: `Hide`, role: 'hide' },
            {
              label: `Hide Others`,
              role: 'hideothers'
            },
            {
              label: `Unhide`,
              role: 'unhide'
            },
            { type: 'separator' },
            {
              label: `Quit`,
              role: 'quit'
            } as any
          ]
        }
      ]
    : [];
}
