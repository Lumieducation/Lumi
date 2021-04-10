import electron from 'electron';
import SocketIO from 'socket.io';
import editMenu from './editMenu';

import helpMenu from './helpMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
    editMenu(),
    helpMenu(window, websocket)
];
