import electron from 'electron';
import SocketIO from 'socket.io';
import i18next from 'i18next';

import helpMenu from './helpMenu';
import editMenu from './editMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
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
    helpMenu(window, websocket)
];
