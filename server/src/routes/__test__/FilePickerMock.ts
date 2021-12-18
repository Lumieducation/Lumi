import FileHandle from '../../state/FileHandle';
import { IFilePickers } from '../../types';

export default class FilePickerMock implements IFilePickers {
    async openDirectory(
        defaultPath: string,
        parentBrowserWindow?: Electron.CrossProcessExports.BrowserWindow
    ): Promise<FileHandle> {
        return { filename: '', handleId: '' };
    }
    async openMultipleFiles(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        parentBrowserWindow?: Electron.CrossProcessExports.BrowserWindow
    ): Promise<FileHandle[]> {
        return [{ filename: '', handleId: '' }];
    }
    async openSingleFile(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        parentBrowserWindow?: Electron.CrossProcessExports.BrowserWindow
    ): Promise<FileHandle> {
        return { filename: '', handleId: '' };
    }
    async saveFile(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        title: string,
        buttonLabel: string,
        parentBrowserWindow?: Electron.CrossProcessExports.BrowserWindow
    ): Promise<FileHandle> {
        return { filename: '', handleId: '' };
    }
}
