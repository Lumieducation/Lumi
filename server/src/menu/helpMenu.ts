import electron from 'electron';
import SocketIO from 'socket.io';
import { TFunction } from 'i18next';

export default function (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server,
    t: TFunction
): any {
    return {
        label: t('menu.help.label'),
        submenu: [
            {
                click: () => {
                    websocket.emit('action', {
                        type: 'REPORT_ISSUE'
                    });
                },
                label: t('menu.help.report_issue')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    window.webContents.openDevTools();
                },
                label: t('menu.help.toggle_developer_tools')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    electron.shell.openExternal(
                        'https://www.twitter.com/Lumieducation'
                    );
                },
                label: t('menu.help.follow_us_on_twitter')
            },
            // { label: 'Check for Updates...', click: updater },
            { role: 'about' }
        ]
    };
}
