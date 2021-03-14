import electron from 'electron';
import SocketIO from 'socket.io';

import helpMenu from './helpMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
    helpMenu(window, websocket)
];
