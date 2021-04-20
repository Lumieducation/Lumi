import i18next from 'i18next';
const isMac = process.platform === 'darwin';

export default function (): any {
    return isMac
        ? [
              {
                  label: i18next.t('lumi:menu.view.label'),
                  submenu: [
                      {
                          label: i18next.t('lumi:menu.view.resetZoom'),
                          role: 'resetZoom'
                      },
                      {
                          label: i18next.t('lumi:menu.view.zoomIn'),
                          role: 'zoomIn'
                      },
                      {
                          label: i18next.t('lumi:menu.view.zoomOut'),
                          role: 'zoomOut'
                      },
                      { type: 'separator' },
                      {
                          label: i18next.t('lumi:menu.view.togglefullscreen'),
                          role: 'togglefullscreen'
                      }
                  ]
              }
          ]
        : [];
}
