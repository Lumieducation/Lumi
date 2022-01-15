import { shell, BrowserWindow } from 'electron';
import path from 'path';
import os from 'os';
import StateStorage from '../state/electronState';

/**
 * Creates an Electron client window.
 * @param port
 * @param isDevelopment
 * @returns
 */
export default function createWindow(
    port: number,
    isDevelopment: boolean,
    electronState: StateStorage
): BrowserWindow {
    const hostname = `http://localhost:${port}`;

    const window = new BrowserWindow({
        height: 800,
        minHeight: 600,
        minWidth: 500,
        width: 1000
    });

    if (isDevelopment) {
        window.webContents.openDevTools();
        if (process.env.REDUX_EXTENSION) {
            const ses = window.webContents.session;

            ses.loadExtension(
                path.join(
                    os.homedir(),
                    `/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.1_0`
                )
            );
        }
        window.loadURL(hostname);
    } else {
        window.loadURL(hostname);
    }

    window.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    });

    window.webContents.on('devtools-opened', () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    window.webContents.on('will-navigate', (e, url) => {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });

    window.webContents.on('before-input-event', (event, input) => {
        if (electronState.getState().blockKeyboard) {
            event.preventDefault();
        }
    });
    return window;
}
