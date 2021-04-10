import i18next from 'i18next';
const isMac = process.platform === 'darwin';

export default function (): any {
    return isMac
        ? [
              {
                  label: 'Lumi',
                  submenu: [
                      {
                          label: i18next.t('lumi:menu.help.about'),
                          role: 'about'
                      },
                      { type: 'separator' },
                      {
                          label: i18next.t('lumi:menu.mac.services'),
                          role: 'services'
                      },
                      { type: 'separator' },
                      { label: i18next.t('lumi:menu.mac.hide'), role: 'hide' },
                      {
                          label: i18next.t('lumi:menu.mac.hideothers'),
                          role: 'hideothers'
                      },
                      {
                          label: i18next.t('lumi:menu.mac.unhide'),
                          role: 'unhide'
                      },
                      { type: 'separator' },
                      {
                          label: i18next.t('lumi:menu.quit'),
                          role: 'quit'
                      } as any
                  ]
              }
          ]
        : [];
}
