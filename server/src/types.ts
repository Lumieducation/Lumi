import { BrowserWindow } from 'electron';

import FileHandle from './state/FileHandle';

export interface IFilePickers {
    openDirectory(
        defaultPath: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle>;

    openMultipleFiles(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle[]>;

    openSingleFile(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle>;

    saveFile(
        extensions: string[],
        extensionName: string,
        defaultPath: string,
        title: string,
        buttonLabel: string,
        parentBrowserWindow?: BrowserWindow
    ): Promise<FileHandle>;
}

export interface IPlatformInformation {
    package: string;
    platform: string;
    supportsUpdates: 'no' | 'external' | 'yes';
}
