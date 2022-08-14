import electron from 'electron';
import SocketIO from 'socket.io';
import editMenu from './editMenu';

import macMenu from './macMenu';
import helpMenu from './helpMenu';
import windowMenu from './windowMenu';
import viewMenu from './viewMenu';

export default (window: electron.BrowserWindow): electron.MenuItem[] => [
    ...macMenu(),
    editMenu(),
    ...viewMenu(),
    ...windowMenu(),
    helpMenu(window)
];
