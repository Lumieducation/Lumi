import electron from 'electron';
import SocketIO from 'socket.io';
import i18next from 'i18next';
import path from 'path';

import helpMenu from './helpMenu';
import editMenu from './editMenu';
import macMenu from './macMenu';
import windowMenu from './windowMenu';
import viewMenu from './viewMenu';
import SettingsCache from '../config/SettingsCache';
import StateStorage from '../state/electronState';
import FileController from '../controllers/FileController';

export default (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server,
    settingsCache: SettingsCache,
    electronState: StateStorage,
    fileController: FileController
): electron.MenuItem[] =>
    [
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
                    click: async () => {
                        const fileHandles = await fileController.pickH5PFiles();
                        if (
                            fileHandles?.length > 0 &&
                            fileHandles[0] !== undefined
                        ) {
                            electronState.setState({
                                lastDirectory: path.dirname(fileHandles[0].path)
                            });
                        }
                        websocket.emit('action', {
                            payload: {
                                files: fileHandles
                            },
                            type: 'OPEN_H5P'
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
                settingsCache.getSettingsSync().allowPrerelease &&
                settingsCache.getSettingsSync().enableLumiRun
                    ? {
                          label: i18next.t('lumi:menu.run.upload'),
                          click: () => {
                              websocket.emit('action', {
                                  payload: {},
                                  type: 'UPLOAD_TO_RUN'
                              });
                          }
                      }
                    : undefined,
                { type: 'separator' } as any,
                {
                    label: i18next.t('lumi:menu.quit'),
                    role: 'quit'
                } as any
            ].filter((e) => e !== undefined)
        },
        editMenu(),
        ...viewMenu(),
        ...windowMenu(),
        helpMenu(window)
    ].filter((m) => m !== undefined);
