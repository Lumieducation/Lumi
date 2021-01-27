import electron from 'electron';
import nucleus from 'nucleus-nodejs';
import SocketIO from 'socket.io';

import helpMenu from './helpMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
    {
        label: 'File',
        submenu: [
            {
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    nucleus.track('menu/click/analytics/import');
                    websocket.emit('action', {
                        payload: {},
                        type: 'IMPORT_ANALYTICS'
                    });
                },
                label: 'Open Analytic Files'
            },
            { type: 'separator' } as any,
            {
                role: 'quit'
            } as any
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
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
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectAll'
            }
        ]
    },
    helpMenu(window, websocket)
];
