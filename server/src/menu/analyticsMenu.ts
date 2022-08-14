import electron from 'electron';
import SocketIO from 'socket.io';
import i18next from 'i18next';

import macMenu from './macMenu';
import helpMenu from './helpMenu';
import editMenu from './editMenu';
import windowMenu from './windowMenu';
import viewMenu from './viewMenu';

export default (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server
): electron.MenuItem[] => [
    ...macMenu(),
    {
        label: i18next.t('lumi:menu.file.label'),
        submenu: [
            {
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    websocket.emit('action', {
                        payload: {},
                        type: 'IMPORT_ANALYTICS'
                    });
                },
                label: i18next.t('lumi:menu.file.open')
            },
            { type: 'separator' } as any,
            {
                label: i18next.t('lumi:menu.quit'),
                role: 'quit'
            } as any
        ]
    },
    editMenu(),
    ...viewMenu(),
    ...windowMenu(),
    helpMenu(window)
];
