import i18next from 'i18next';
const isMac = process.platform === 'darwin';

import { createMainWindow } from '../main';

import { globalWebsocket } from '../boot/websocket';

export default function (): any {
    return isMac
        ? [
              {
                  label: i18next.t('lumi:menu.window.label'),
                  submenu: [
                      {
                          label: i18next.t('lumi:menu.window.minimize'),
                          role: 'minimize'
                      },
                      {
                          label: i18next.t('lumi:menu.window.zoom'),
                          role: 'zoom'
                      },
                      ...(isMac
                          ? [
                                { type: 'separator' },
                                {
                                    label: i18next.t('lumi:menu.window.front'),
                                    role: 'front'
                                },
                                { type: 'separator' },
                                {
                                    accelerator: 'CmdOrCtrl+)',
                                    click: () => {
                                        createMainWindow(globalWebsocket);
                                    },
                                    label: i18next.t('lumi:menu.window.show')
                                }
                            ]
                          : [
                                {
                                    label: i18next.t('lumi:menu.window.close'),
                                    role: 'close'
                                }
                            ])
                  ]
              }
          ]
        : [];
}
