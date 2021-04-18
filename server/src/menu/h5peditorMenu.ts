import electron from 'electron';
import SocketIO from 'socket.io';
import i18next from 'i18next';

import helpMenu from './helpMenu';
import editMenu from './editMenu';
import macMenu from './macMenu';
import windowMenu from './windowMenu';
import viewMenu from './viewMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
    ...macMenu(),
    {
        label: i18next.t('lumi:menu.file.label'),
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
                label: i18next.t('lumi:menu.h5peditor.new')
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
                label: i18next.t('lumi:menu.h5peditor.open')
            },
            { type: 'separator' } as any,
            {
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    websocket.emit('action', {
                        type: 'SAVE'
                    });
                },
                label: i18next.t('lumi:menu.file.save')
            },
            {
                accelerator: 'Shift+CmdOrCtrl+S',
                click: () => {
                    websocket.emit('action', {
                        type: 'SAVE_AS'
                    });
                },
                label: i18next.t('lumi:menu.file.save_as')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    websocket.emit('action', {
                        type: 'EXPORT_AS_HTML'
                    });
                },
                label: i18next.t('lumi:menu.file.export')
            },
            { type: 'separator' } as any,
            {
                label: i18next.t('lumi:menu.quit'),
                role: 'quit'
            } as any
        ]
    },
    editMenu(),
    viewMenu(),
    windowMenu(),
    helpMenu(window, websocket)
];
