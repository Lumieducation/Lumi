import electron from 'electron';
import SocketIO from 'socket.io';
import editMenu from './editMenu';

import helpMenu from './helpMenu';

export default (window: electron.BrowserWindow): electron.MenuItem[] => [
    editMenu(),
    helpMenu(window)
];
