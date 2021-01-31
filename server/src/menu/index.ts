import electron from 'electron';

import analyticsMenu from './analyticsMenu';
import h5peditorMenu from './h5peditorMenu';
import launchpadMenu from './launchpadMenu';

export default function menuHandler(
    path: string,
    window: electron.BrowserWindow,
    webSocket: SocketIO.Server
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
                    h5peditorMenu(window, webSocket)
                )
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
