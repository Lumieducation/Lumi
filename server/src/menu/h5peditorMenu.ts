import electron from 'electron';
import SocketIO from 'socket.io';
import i18next from 'i18next';

import helpMenu from './helpMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
    {
        label: i18next.t('menu.file.file'),
        submenu: [
            {
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    websocket.emit('action', {
                        payload: {
                            contentId: Math.round(Math.random() * 100000)
                        },
                        type: 'NEW_H5P'
                    });
                },
                label: i18next.t('menu.h5peditor.new')
            },
            { type: 'separator' } as any,
            {
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    electron.dialog
                        .showOpenDialog({
                            filters: [
                                {
                                    extensions: ['h5p'],
                                    name: 'HTML 5 Package'
                                }
                            ],
                            properties: ['openFile', 'multiSelections']
                        })
                        .then(({ filePaths }) => {
                            websocket.emit('action', {
                                payload: {
                                    paths: filePaths
                                },
                                type: 'OPEN_H5P'
                            });
                        });
                },
                label: i18next.t('menu.h5peditor.open')
            },
            { type: 'separator' } as any,
            {
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    websocket.emit('action', {
                        type: 'SAVE'
                    });
                },
                label: i18next.t('menu.file.save')
            },
            {
                accelerator: 'Shift+CmdOrCtrl+S',
                click: () => {
                    websocket.emit('action', {
                        type: 'SAVE_AS'
                    });
                },
                label: i18next.t('menu.file.save_as')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    websocket.emit('action', {
                        type: 'EXPORT_AS_HTML'
                    });
                },
                label: i18next.t('menu.file.export')
            },
            { type: 'separator' } as any,
            {
                role: 'quit'
            } as any
        ]
    },
    {
        label: i18next.t('menu.file.edit'),
        submenu: [
            {
                label: i18next.t('menu.file.undo'),
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: i18next.t('menu.file.redo'),
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
                label: i18next.t('menu.file.cut'),
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: i18next.t('menu.file.copy'),
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: i18next.t('menu.file.paste'),
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: i18next.t('menu.file.select_all'),
                accelerator: 'CmdOrCtrl+A',
                role: 'selectAll'
            }
        ]
    },
    helpMenu(window, websocket)
];
