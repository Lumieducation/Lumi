import { autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import dialog_error_show from '../../ops/dialog_error_show';
import window_settings_open from '../../ops/window_settings_open';

export default function lumi_menu(ctx: Context) {
  return [
    {
      label: 'Lumi',
      submenu: [
        {
          label: ctx.translate(`About Lumi`)
        },
        {
          label: ctx.translate(`Check for updates`),
          click: async () => {
            try {
              await autoUpdater.checkForUpdatesAndNotify();
            } catch (error) {
              await dialog_error_show(
                ctx.translate(`Error checking for updates`),
                JSON.stringify(error.message)
              );
            }
          }
        },
        { type: 'separator' },
        {
          label: ctx.translate(`Settings`),
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            window_settings_open(ctx);
          }
        }
      ]
    }
  ];
}
