import electron from 'electron';
import SocketIO from 'socket.io';
import editMenu from './editMenu';

import macMenu from './macMenu';
import helpMenu from './helpMenu';

export default (window: electron.BrowserWindow, websocket: SocketIO.Server) => [
    ...macMenu(),
    editMenu(),
    helpMenu(window, websocket)
];
