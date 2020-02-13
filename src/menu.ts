import electron from 'electron';
import websocket from './server/websocket';

export default (window: electron.BrowserWindow) => [
    {
        label: 'Menu',
        submenu: [
            { role: 'about' },
            // { label: 'Check for Updates...', click: updater },
            { type: 'separator' } as any,
            {
                role: 'quit'
            } as any
        ]
    },
    {
        label: 'File',
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
                label: 'New H5P'
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
                            properties: ['openDirectory']
                        })
                        .then(({ filePaths }) => {
                            websocket.emit('action', {
                                payload: {
                                    path: filePaths[0]
                                },
                                type: 'OPEN_FOLDER'
                            });
                        });
                },
                label: 'Open Folder'
            },
            { type: 'separator' } as any,
            {
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    websocket.emit('action', {
                        type: 'SAVE'
                    });
                },
                label: 'Save'
            },
            {
                accelerator: 'Shift+CmdOrCtrl+S',
                click: () => {
                    websocket.emit('action', {
                        type: 'SAVE_AS'
                    });
                },
                label: 'Save as...'
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                click: () => {
                    websocket.emit('action', {
                        type: 'REPORT_ISSUE'
                    });
                },
                label: 'Report Issue'
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    window.webContents.openDevTools();
                },
                label: 'Toggle Developer Tools'
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    electron.shell.openExternal(
                        'https://www.twitter.com/Lumieducation'
                    );
                },
                label: 'Follow Us on Twitter'
            }
        ]
    }
];
