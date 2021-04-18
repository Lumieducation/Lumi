import i18next from 'i18next';

export default function (): any {
    return {
        label: i18next.t('lumi:menu.view.label'),
        submenu: [
            { label: i18next.t('lumi:menu.view.reload'), role: 'reload' },
            {
                label: i18next.t('lumi:menu.view.forceReload'),
                role: 'forceReload'
            },
            {
                label: i18next.t('lumi:menu.view.toggleDevTools'),
                role: 'toggleDevTools'
            },
            { type: 'separator' },
            { label: i18next.t('lumi:menu.view.resetZoom'), role: 'resetZoom' },
            { label: i18next.t('lumi:menu.view.zoomIn'), role: 'zoomIn' },
            { label: i18next.t('lumi:menu.view.zoomOut'), role: 'zoomOut' },
            { type: 'separator' },
            {
                label: i18next.t('lumi:menu.view.togglefullscreen'),
                role: 'togglefullscreen'
            }
        ]
    };
}
