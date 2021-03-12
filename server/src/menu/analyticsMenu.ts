import electron from 'electron';
import SocketIO from 'socket.io';
import { TFunction } from 'i18next';

import helpMenu from './helpMenu';

export default (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server,
    t: TFunction
) => [
    {
        label: t('menu.file.label'),
        submenu: [
            {
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    websocket.emit('action', {
                        payload: {},
                        type: 'IMPORT_ANALYTICS'
                    });
                },
                label: t('menu.file.open')
            },
            { type: 'separator' } as any,
            {
                label: t('menu.quit'),
                role: 'quit'
            } as any
        ]
    },
    {
        label: t('menu.file.edit'),
        submenu: [
            {
                label: t('menu.file.undo'),
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: t('menu.file.redo'),
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
                label: t('menu.file.cut'),
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: t('menu.file.copy'),
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: t('menu.file.paste'),
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: t('menu.file.select_all'),
                accelerator: 'CmdOrCtrl+A',
                role: 'selectAll'
            }
        ]
    },
    helpMenu(window, websocket, t)
];
