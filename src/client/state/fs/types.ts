// types

export interface ITreeEntry {
    children?: ITreeEntry[];
    name: string;
    path: string;
    type: 'directory' | 'file';
}

// state (reducer)
export interface IFS {
    activePath?: string;
    currentDirectory?: string;
    fileTree: ITreeEntry;
    root?: string;
}

export interface IState {
    fs: IFS;
}

// actions

export interface IUpdateFileTreeAction {
    payload: ITreeEntry;
    type: typeof LUMIFS_UPDATE_FILETREE;
}

export interface IUpdateFileTreeRootAction {
    payload: {
        root: string;
    };
    type: typeof LUMIFS_UPDATE_ROOT;
}

export interface IUpdateCurrentDirectoryAction {
    payload: {
        currentDirectory: string;
        type: 'file' | 'directory';
    };
    type: typeof LUMIFS_SET_CURRENTDIRECTORY;
}

export type ActionTypes =
    | IUpdateFileTreeAction
    | IUpdateFileTreeRootAction
    | IUpdateCurrentDirectoryAction;

// constants

export const LUMIFS_UPDATE_FILETREE = 'LUMIFS_UPDATE_FILETREE';
export const LUMIFS_UPDATE_ROOT = 'LUMIFS_UPDATE_ROOT';
export const LUMIFS_GET_FILETREE_REQUEST = 'LUMIFS_GET_FILETREE_REQUEST';
export const LUMIFS_GET_FILETREE_SUCCESS = 'LUMIFS_GET_FILETREE_SUCCESS';
export const LUMIFS_GET_FILETREE_ERROR = 'LUMIFS_GET_FILETREE_ERROR';
export const LUMIFS_CREATE_DIRECTORY_REQUEST =
    'LUMIFS_CREATE_DIRECTORY_REQUEST';
export const LUMIFS_CREATE_DIRECTORY_SUCCESS =
    'LUMIFS_CREATE_DIRECTORY_SUCCESSS';
export const LUMIFS_CREATE_DIRECTORY_ERROR = 'LUMIFS_CREATE_DIRECTORY_ERROR';
export const LUMIFS_SET_CURRENTDIRECTORY = 'LUMIFS_SET_CURRENTDIRECTORY';
