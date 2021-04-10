import i18next from 'i18next';

export default function (): any {
    return {
        label: i18next.t('lumi:menu.file.edit'),
        submenu: [
            {
                label: i18next.t('lumi:menu.file.undo'),
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: i18next.t('lumi:menu.file.redo'),
                accelerator:
                    process.platform !== 'darwin'
                        ? 'CmdOrCtrl+Y'
                        : 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: i18next.t('lumi:menu.file.cut'),
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: i18next.t('lumi:menu.file.copy'),
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: i18next.t('lumi:menu.file.paste'),
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: i18next.t('lumi:menu.file.select_all'),
                accelerator: 'CmdOrCtrl+A',
                role: 'selectAll'
            }
        ]
    };
}
