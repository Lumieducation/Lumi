import electron from 'electron';
import SocketIO from 'socket.io';
import SettingsCache from '../config/SettingsCache';

import analyticsMenu from './analyticsMenu';
import h5peditorMenu from './h5peditorMenu';
import launchpadMenu from './launchpadMenu';
import runMenu from './runMenu';

export default function menuFactory(
    path: string,
    window: electron.BrowserWindow,
    webSocket: SocketIO.Server,
    settingsCache: SettingsCache
): void {
    switch (path) {
        case '/':
        default:
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(
                    launchpadMenu(window, webSocket)
                )
            );
            break;

        case '/h5peditor':
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(
                    h5peditorMenu(window, webSocket, settingsCache)
                )
            );
            break;

        case '/run':
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(runMenu(window, webSocket))
            );
            break;

        case '/analytics':
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(
                    analyticsMenu(window, webSocket)
                )
            );
            break;
    }
}
