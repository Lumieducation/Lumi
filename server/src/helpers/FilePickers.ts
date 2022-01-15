import { BrowserWindow, dialog } from 'electron';
import FileHandle from '../state/FileHandle';
import FileHandleManager from '../state/FileHandleManager';

export default class FilePickers {
    constructor(private handleManager: FileHandleManager) {}

    async openDirectory(
        defaultPath: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle> {
        const result = await dialog.showOpenDialog(parentBrowserWindow, {
            defaultPath,
            properties: ['openDirectory']
        });

        if (result.canceled) {
            return undefined;
        }
        return this.handleManager.create(result.filePaths[0]);
    }

    async openMultipleFiles(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle[]> {
        const result = await dialog.showOpenDialog(parentBrowserWindow, {
            defaultPath,
            filters: [
                {
                    extensions,
                    name: extensionName
                }
            ],
            properties: ['openFile', 'multiSelections']
        });
        if (result.canceled) {
            return [];
        }
        return result.filePaths.map((fp) => this.handleManager.create(fp));
    }

    async openSingleFile(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle> {
        const result = await dialog.showOpenDialog(parentBrowserWindow, {
            defaultPath,
            filters: [
                {
                    extensions,
                    name: extensionName
                }
            ],
            properties: ['openFile']
        });
        if (result.canceled) {
            return undefined;
        }
        return this.handleManager.create(result.filePaths[0]);
    }

    async saveFile(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        title: string,
        buttonLabel: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle> {
        const result = await dialog.showSaveDialog(parentBrowserWindow, {
            buttonLabel,
            defaultPath,
            title,
            filters: [
                {
                    extensions,
                    name: extensionName
                }
            ],
            properties: ['showOverwriteConfirmation']
        });
        if (result.canceled) {
            return undefined;
        }
        return this.handleManager.create(result.filePath);
    }
}
