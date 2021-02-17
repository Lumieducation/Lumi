import electron from 'electron';
import SocketIO from 'socket.io';

export default function (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server
): any {
    return {
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
            },
            // { label: 'Check for Updates...', click: updater },
            { role: 'about' }
        ]
    };
}
