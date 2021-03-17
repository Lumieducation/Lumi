import electron from 'electron';
import SocketIO from 'socket.io';
import i18next from 'i18next';

export default function (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server
): any {
    return {
        label: i18next.t('lumi:menu.help.label'),
        submenu: [
            {
                click: () => {
                    websocket.emit('action', {
                        type: 'REPORT_ISSUE'
                    });
                },
                label: i18next.t('lumi:menu.help.report_issue')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    window.webContents.openDevTools();
                },
                label: i18next.t('lumi:menu.help.toggle_developer_tools')
            },
            { type: 'separator' } as any,
            {
                click: () => {
                    electron.shell.openExternal(
                        'https://www.twitter.com/Lumieducation'
                    );
                },
                label: i18next.t('lumi:menu.help.follow_us_on_twitter')
            },
            // { label: 'Check for Updates...', click: updater },
            { label: i18next.t('lumi:menu.help.about'), role: 'about' }
        ]
    };
}
