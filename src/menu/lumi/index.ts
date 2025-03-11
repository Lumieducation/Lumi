import { app, dialog } from 'electron';
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
          label: ctx.translate(`About Lumi`),
          click: async () => {
            dialog.showMessageBox({
              title: ctx.translate(`About Lumi`),
              message: ctx.translate(
                `Lumi v{{version}} \n (C) 2025 Lumi Education UG (hb) \n Written by \n Jan Philip Schellenberg \n  Sebastian Rettig \n AGPL 3.0 License`,
                {
                  version: app.getVersion()
                }
              ),
              buttons: [ctx.translate(`OK`)]
            });
          }
        },
        {
          label: ctx.translate(`Check for updates`),
          click: async () => {
            try {
              ctx.show_no_update_message = true;
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
