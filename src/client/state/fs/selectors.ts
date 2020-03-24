import { IState, ITreeEntry } from './types';

import debug from 'debug';

const log = debug('lumi:LUMIFS:selectors');

export const errorObject: ITreeEntry = {
    name: 'error',
    path: '/',
    type: 'directory'
};

export function activePath(state: IState): string {
    try {
        log(`selecting activePath: ${state.fs.activePath}`);
        return state.fs.activePath || '';
    } catch (error) {
        log(error);
        return '';
    }
}
export function currentDirectory(state: IState): string {
    try {
        log(`selecting currenDirectory: ${state.fs.currentDirectory}`);
        return state.fs.currentDirectory || '';
    } catch (error) {
        log(error);
        return '';
    }
}
export function fileTree(state: IState): ITreeEntry {
    try {
        log(`selecting fileTree`);
        return state.fs.fileTree || errorObject;
    } catch (error) {
        log(error);
        return errorObject;
    }
}

export function root(state: IState): string | undefined {
    try {
        log(`selecting root: ${state.fs.root}`);
        return state.fs.root;
    } catch (error) {
        log(error);
        return undefined;
    }
}
