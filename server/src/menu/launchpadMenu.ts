import electron from 'electron';
import SocketIO from 'socket.io';

import { TFunction } from 'i18next';

import helpMenu from './helpMenu';

export default (
    window: electron.BrowserWindow,
    websocket: SocketIO.Server,
    t: TFunction
) => [helpMenu(window, websocket, t)];
