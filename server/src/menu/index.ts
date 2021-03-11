import electron from 'electron';

import analyticsMenu from './analyticsMenu';
import h5peditorMenu from './h5peditorMenu';
import launchpadMenu from './launchpadMenu';

import { TFunction } from 'i18next';

export default function menuFactory(
    path: string,
    window: electron.BrowserWindow,
    webSocket: SocketIO.Server,
    t: TFunction
): void {
    switch (path) {
        case '/':
        default:
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(
                    launchpadMenu(window, webSocket, t)
                )
            );
            break;

        case '/h5peditor':
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(
                    h5peditorMenu(window, webSocket, t)
                )
            );
            break;

        case '/analytics':
            electron.Menu.setApplicationMenu(
                electron.Menu.buildFromTemplate(
                    analyticsMenu(window, webSocket, t)
                )
            );
            break;
    }
}
